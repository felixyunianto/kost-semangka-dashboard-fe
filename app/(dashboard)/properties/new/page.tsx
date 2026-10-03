"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_PROPERTY_LIST_QUERY_KEY, PROPERTIES_ROUTE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { createProperty } from "@/lib/services";
import { toast } from "@/store";

import { PropertyForm } from "../components/PropertyForm";

export default function NewPropertyPage() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (property) => {
      if (!property) return;

      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      toast.success(t("common.toast.created"));
      router.push(PROPERTIES_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={PROPERTIES_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("PropertyPage.form.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("PropertyPage.form.addTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("PropertyPage.form.addSubtitle")}
      </p>
      <div className="mt-6">
        <PropertyForm
          isSubmitting={createPropertyMutation.isPending}
          submitError={createPropertyMutation.error?.message}
          onSubmit={(payload) => {
            createPropertyMutation.mutate(payload);
          }}
        />
      </div>
    </section>
  );
}
