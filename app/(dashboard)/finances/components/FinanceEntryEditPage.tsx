"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loading } from "@/components/Loading";
import {
  EXPENSES_ROUTE,
  GET_EXPENSE_DETAIL_QUERY_KEY,
  GET_EXPENSE_LIST_QUERY_KEY,
  GET_FINANCE_REPORT_QUERY_KEY,
  GET_INCOME_DETAIL_QUERY_KEY,
  GET_INCOME_LIST_QUERY_KEY,
  INCOMES_ROUTE,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFinanceEntry, updateFinanceEntry } from "@/lib/services";
import { toast } from "@/store";

import { FinanceEntryForm } from "./FinanceEntryForm";

import type { TFinanceKind, TUpdateFinanceEntryPayload } from "@/lib/entities";

type TFinanceEntryEditPageProps = {
  kind: TFinanceKind;
  params: Promise<{ entryId: string }>;
};

export function FinanceEntryEditPage({ kind, params }: TFinanceEntryEditPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <FinanceEntryEditPageContent kind={kind} params={params} />
    </Suspense>
  );
}

function FinanceEntryEditPageContent({ kind, params }: TFinanceEntryEditPageProps) {
  const { entryId } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const copyKey = kind === "income" ? "FinancePage.income" : "FinancePage.expense";
  const listHref = kind === "income" ? INCOMES_ROUTE : EXPENSES_ROUTE;
  const listQueryKey = kind === "income" ? GET_INCOME_LIST_QUERY_KEY : GET_EXPENSE_LIST_QUERY_KEY;
  const detailQueryKey =
    kind === "income" ? GET_INCOME_DETAIL_QUERY_KEY : GET_EXPENSE_DETAIL_QUERY_KEY;

  const entryQuery = useQuery({
    queryKey: [...detailQueryKey, entryId],
    queryFn: () => getFinanceEntry(kind, entryId),
  });

  const updateEntryMutation = useMutation({
    mutationFn: (payload: TUpdateFinanceEntryPayload) =>
      updateFinanceEntry(kind, entryId, payload),
    onSuccess: (entry) => {
      if (!entry) return;

      void queryClient.invalidateQueries({ queryKey: listQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...detailQueryKey, entryId] });
      void queryClient.invalidateQueries({ queryKey: GET_FINANCE_REPORT_QUERY_KEY });
      toast.success(t("common.toast.updated"));
      router.push(listHref);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t(`${copyKey}.back`)}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t(`${copyKey}.editTitle`)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t(`${copyKey}.editSubtitle`)}
      </p>
      <div className="mt-6">
        {entryQuery.isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}
        {entryQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">{t(`${copyKey}.empty`)}</p>
            <button
              type="button"
              onClick={() => {
                void entryQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}
        {entryQuery.data ? (
          <FinanceEntryForm
            key={entryQuery.data.id}
            kind={kind}
            entry={entryQuery.data}
            isSubmitting={updateEntryMutation.isPending}
            submitError={updateEntryMutation.error?.message}
            onSubmit={(data) => {
              const payload = data.payload as TUpdateFinanceEntryPayload;
              updateEntryMutation.mutate({
                category: payload.category,
                amount: payload.amount,
                occurredAt: payload.occurredAt,
                description: payload.description,
                notes: payload.notes ?? "",
              });
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
