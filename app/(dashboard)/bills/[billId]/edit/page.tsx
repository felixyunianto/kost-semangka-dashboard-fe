"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loading } from "@/components/Loading";
import {
  BILLS_ROUTE,
  GET_BILL_DETAIL_QUERY_KEY,
  GET_BILL_LIST_QUERY_KEY,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getBill, updateBill } from "@/lib/services";
import { toast } from "@/store";

import { BillForm } from "../../components/BillForm";

import type { TUpdateBillPayload } from "@/lib/entities";

export default function EditBillPage({
  params,
}: {
  params: Promise<{ billId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <EditBillPageContent params={params} />
    </Suspense>
  );
}

function EditBillPageContent({
  params,
}: {
  params: Promise<{ billId: string }>;
}) {
  const { billId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const billQuery = useQuery({
    queryKey: [...GET_BILL_DETAIL_QUERY_KEY, billId],
    queryFn: () => getBill(billId),
  });

  const updateBillMutation = useMutation({
    mutationFn: (payload: TUpdateBillPayload) => updateBill(billId, payload),
    onSuccess: (bill) => {
      if (!bill) return;

      void queryClient.invalidateQueries({
        queryKey: GET_BILL_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_BILL_DETAIL_QUERY_KEY, billId],
      });
      toast.success(t("common.toast.updated"));
      router.push(BILLS_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={BILLS_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("BillPage.form.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("BillPage.form.editTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("BillPage.form.editSubtitle")}
      </p>
      <div className="mt-6">
        {billQuery.isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}
        {billQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">{t("BillPage.table.empty")}</p>
            <button
              type="button"
              onClick={() => {
                void billQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}
        {billQuery.data ? (
          <BillForm
            bill={billQuery.data}
            isSubmitting={updateBillMutation.isPending}
            submitError={updateBillMutation.error?.message}
            onSubmit={(data) => {
              const payload = data.payload as TUpdateBillPayload;
              updateBillMutation.mutate({
                amount: payload.amount,
                dueDate: payload.dueDate,
                description: payload.description,
              });
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
