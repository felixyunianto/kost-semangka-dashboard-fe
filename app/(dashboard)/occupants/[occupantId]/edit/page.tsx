"use client";

import { Suspense, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loading } from "@/components/Loading";
import {
  GET_OCCUPANT_DETAIL_QUERY_KEY,
  GET_OCCUPANT_LIST_QUERY_KEY,
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  OCCUPANTS_ROUTE,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getOccupant, getProperties, updateOccupant } from "@/lib/services";
import { toast } from "@/store";

import { OccupantForm } from "../../components/OccupantForm";

import type { TUpdateOccupantPayload } from "@/lib/entities";

export default function EditOccupantPage({
  params,
}: {
  params: Promise<{ occupantId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <EditOccupantPageContent params={params} />
    </Suspense>
  );
}

function EditOccupantPageContent({
  params,
}: {
  params: Promise<{ occupantId: string }>;
}) {
  const { occupantId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const occupantQuery = useQuery({
    queryKey: [...GET_OCCUPANT_DETAIL_QUERY_KEY, occupantId],
    queryFn: () => getOccupant(occupantId),
  });

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
    enabled: Boolean(occupantQuery.data) && !occupantQuery.data?.room?.property?.id,
  });

  const occupant = occupantQuery.data;
  const resolvedLocation = useMemo(() => {
    if (!occupant) {
      return { propertyId: "", propertyName: "", roomName: "" };
    }

    const propertyFromOccupant = occupant.room?.property;
    if (propertyFromOccupant) {
      return {
        propertyId: propertyFromOccupant.id,
        propertyName: propertyFromOccupant.name,
        roomName: occupant.room?.name ?? "",
      };
    }

    const properties = propertiesQuery.data?.items ?? [];
    const property = properties.find((item) =>
      (item.rooms ?? []).some((room) => room.id === occupant.roomId),
    );
    const room = property?.rooms?.find((item) => item.id === occupant.roomId);

    return {
      propertyId: property?.id ?? "",
      propertyName: property?.name ?? "",
      roomName: occupant.room?.name ?? room?.name ?? "",
    };
  }, [occupant, propertiesQuery.data?.items]);

  const updateOccupantMutation = useMutation({
    mutationFn: ({
      propertyId,
      roomId,
      payload,
    }: {
      propertyId: string;
      roomId: string;
      payload: TUpdateOccupantPayload;
    }) => {
      return updateOccupant(propertyId, roomId, occupantId, payload);
    },
    onSuccess: (updated, variables) => {
      if (!updated) return;

      void queryClient.invalidateQueries({
        queryKey: GET_OCCUPANT_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_OCCUPANT_DETAIL_QUERY_KEY, occupantId],
      });
      void queryClient.invalidateQueries({
        queryKey: GET_ROOM_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, variables.propertyId],
      });
      toast.success(t("common.toast.updated"));
      router.push(OCCUPANTS_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const isLoading = occupantQuery.isLoading || propertiesQuery.isLoading;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={OCCUPANTS_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("OccupantPage.form.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("OccupantPage.form.editTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("OccupantPage.form.editSubtitle")}
      </p>
      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}
        {occupantQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">{t("OccupantPage.table.empty")}</p>
            <button
              type="button"
              onClick={() => {
                void occupantQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}
        {occupant ? (
          <OccupantForm
            occupant={occupant}
            propertyId={resolvedLocation.propertyId}
            propertyName={resolvedLocation.propertyName}
            roomName={resolvedLocation.roomName}
            isSubmitting={updateOccupantMutation.isPending}
            submitError={updateOccupantMutation.error?.message}
            onSubmit={(data) => {
              const nextPropertyId = data.propertyId || resolvedLocation.propertyId;
              const nextRoomId = data.roomId || occupant.roomId;

              updateOccupantMutation.mutate({
                propertyId: nextPropertyId,
                roomId: nextRoomId,
                payload: {
                  fullName: data.payload.fullName,
                  email: data.payload.email,
                  phone: data.payload.phone ?? "",
                  checkIn: data.payload.checkIn,
                  ...(data.payload.checkOut
                    ? { checkOut: data.payload.checkOut }
                    : {}),
                },
              });
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
