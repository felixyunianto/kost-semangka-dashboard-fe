"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  GET_OCCUPANT_LIST_QUERY_KEY,
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  OCCUPANTS_ROUTE,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { createOccupant } from "@/lib/services";
import { toast } from "@/store";

import { OccupantForm } from "../components/OccupantForm";

import type { TCreateOccupantPayload } from "@/lib/entities";

export default function NewOccupantPage() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createOccupantMutation = useMutation({
    mutationFn: ({
      propertyId,
      roomId,
      payload,
    }: {
      propertyId: string;
      roomId: string;
      payload: TCreateOccupantPayload;
    }) => {
      return createOccupant(propertyId, roomId, payload);
    },
    onSuccess: (occupant, variables) => {
      if (!occupant) return;

      void queryClient.invalidateQueries({
        queryKey: GET_OCCUPANT_LIST_QUERY_KEY,
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
      toast.success(t("common.toast.created"));
      router.push(OCCUPANTS_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

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
        {t("OccupantPage.form.addTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("OccupantPage.form.addSubtitle")}
      </p>
      <div className="mt-6">
        <OccupantForm
          isSubmitting={createOccupantMutation.isPending}
          submitError={createOccupantMutation.error?.message}
          onSubmit={(data) => {
            createOccupantMutation.mutate({
              propertyId: data.propertyId,
              roomId: data.roomId,
              payload: {
                fullName: data.payload.fullName,
                email: data.payload.email,
                ...(data.payload.phone && { phone: data.payload.phone }),
                checkIn: data.payload.checkIn,
              },
            });
          }}
        />
      </div>
    </section>
  );
}
