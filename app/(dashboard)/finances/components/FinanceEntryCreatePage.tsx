"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  EXPENSES_ROUTE,
  GET_EXPENSE_LIST_QUERY_KEY,
  GET_FINANCE_REPORT_QUERY_KEY,
  GET_INCOME_LIST_QUERY_KEY,
  INCOMES_ROUTE,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { createFinanceEntry } from "@/lib/services";
import { toast } from "@/store";

import { FinanceEntryForm } from "./FinanceEntryForm";

import type { TCreateFinanceEntryPayload, TFinanceKind } from "@/lib/entities";

type TFinanceEntryCreatePageProps = {
  kind: TFinanceKind;
};

export function FinanceEntryCreatePage({ kind }: TFinanceEntryCreatePageProps) {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const copyKey = kind === "income" ? "FinancePage.income" : "FinancePage.expense";
  const listHref = kind === "income" ? INCOMES_ROUTE : EXPENSES_ROUTE;
  const listQueryKey = kind === "income" ? GET_INCOME_LIST_QUERY_KEY : GET_EXPENSE_LIST_QUERY_KEY;

  const createEntryMutation = useMutation({
    mutationFn: (payload: TCreateFinanceEntryPayload) => createFinanceEntry(kind, payload),
    onSuccess: (entry) => {
      if (!entry) return;

      void queryClient.invalidateQueries({ queryKey: listQueryKey });
      void queryClient.invalidateQueries({ queryKey: GET_FINANCE_REPORT_QUERY_KEY });
      toast.success(t("common.toast.created"));
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
        {t(`${copyKey}.addTitle`)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t(`${copyKey}.addSubtitle`)}
      </p>
      <div className="mt-6">
        <FinanceEntryForm
          kind={kind}
          isSubmitting={createEntryMutation.isPending}
          submitError={createEntryMutation.error?.message}
          onSubmit={(data) => {
            const payload = data.payload as TCreateFinanceEntryPayload;
            createEntryMutation.mutate({
              propertyId: payload.propertyId || data.propertyId,
              category: payload.category,
              amount: payload.amount,
              occurredAt: payload.occurredAt,
              description: payload.description,
              ...(payload.notes ? { notes: payload.notes } : {}),
            });
          }}
        />
      </div>
    </section>
  );
}
