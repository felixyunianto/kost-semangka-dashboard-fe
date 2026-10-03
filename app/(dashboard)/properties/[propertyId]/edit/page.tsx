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
  PROPERTIES_ROUTE,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperty, updateProperty } from "@/lib/services";
import { toast } from "@/store";

import { PropertyForm } from "../../components/PropertyForm";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <EditPropertyPageContent params={params} />
    </Suspense>
  );
}

function EditPropertyPageContent({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const propertyQuery = useQuery({
    queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
    queryFn: () => getProperty(propertyId),
  });

  const updatePropertyMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProperty>[1]) => {
      return updateProperty(propertyId, payload);
    },
    onSuccess: (property) => {
      if (!property) return;

      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
      });
      toast.success(t("common.toast.updated"));
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
        {t("PropertyPage.form.editTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("PropertyPage.form.editSubtitle")}
      </p>
      <div className="mt-6">
        {propertyQuery.isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}
        {propertyQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">
              {t("PropertyPage.table.empty")}
            </p>
            <button
              type="button"
              onClick={() => {
                void propertyQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}
        {propertyQuery.data ? (
          <PropertyForm
            property={propertyQuery.data}
            isSubmitting={updatePropertyMutation.isPending}
            submitError={updatePropertyMutation.error?.message}
            onSubmit={(payload) => {
              updatePropertyMutation.mutate(payload);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
