"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loading } from "@/components/Loading";
import {
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  getPropertyRoomsRoute,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { createRoom } from "@/lib/services";
import { toast } from "@/store";

import { RoomForm } from "../../components/RoomForm";

export default function NewRoomPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <NewRoomPageContent params={params} />
    </Suspense>
  );
}

function NewRoomPageContent({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createRoomMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createRoom>[1]) => {
      return createRoom(propertyId, payload);
    },
    onSuccess: (room) => {
      if (!room) return;

      void queryClient.invalidateQueries({
        queryKey: GET_ROOM_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
      });
      toast.success(t("common.toast.created"));
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
        {t("RoomPage.form.addTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("RoomPage.form.addSubtitle")}
      </p>
      <div className="mt-6">
        <RoomForm
          propertyId={propertyId}
          isSubmitting={createRoomMutation.isPending}
          submitError={createRoomMutation.error?.message}
          onSubmit={(payload) => {
            createRoomMutation.mutate(payload);
          }}
        />
      </div>
    </section>
  );
}
