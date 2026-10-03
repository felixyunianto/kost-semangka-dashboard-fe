"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loading } from "@/components/Loading";
import {
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_DETAIL_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  getPropertyRoomsRoute,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getRoom, updateRoom } from "@/lib/services";
import { toast } from "@/store";

import { RoomForm } from "../../../components/RoomForm";

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ propertyId: string; roomId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <EditRoomPageContent params={params} />
    </Suspense>
  );
}

function EditRoomPageContent({
  params,
}: {
  params: Promise<{ propertyId: string; roomId: string }>;
}) {
  const { propertyId, roomId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const roomQuery = useQuery({
    queryKey: [...GET_ROOM_DETAIL_QUERY_KEY, propertyId, roomId],
    queryFn: () => getRoom(propertyId, roomId),
  });

  const updateRoomMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateRoom>[2]) => {
      return updateRoom(propertyId, roomId, payload);
    },
    onSuccess: (room) => {
      if (!room) return;

      void queryClient.invalidateQueries({
        queryKey: GET_ROOM_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_ROOM_DETAIL_QUERY_KEY, propertyId, roomId],
      });
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
      });
      toast.success(t("common.toast.updated"));
      router.push(getPropertyRoomsRoute(propertyId));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={getPropertyRoomsRoute(propertyId)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("RoomPage.form.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("RoomPage.form.editTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("RoomPage.form.editSubtitle")}
      </p>
      <div className="mt-6">
        {roomQuery.isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}
        {roomQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">{t("RoomPage.table.empty")}</p>
            <button
              type="button"
              onClick={() => {
                void roomQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}
        {roomQuery.data ? (
          <RoomForm
            propertyId={propertyId}
            room={roomQuery.data}
            isSubmitting={updateRoomMutation.isPending}
            submitError={updateRoomMutation.error?.message}
            onSubmit={(payload) => {
              updateRoomMutation.mutate(payload);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
