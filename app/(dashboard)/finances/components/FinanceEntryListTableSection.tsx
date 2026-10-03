"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { Loading } from "@/components/Loading";
import { getExpenseEditRoute, getIncomeEditRoute, getPropertyRoomsRoute } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  PaginationBar,
} from "@/components";

import type { TFinanceEntry, TFinanceKind, TPagination } from "@/lib/entities";

type TFinanceEntryListTableSectionProps = {
  kind: TFinanceKind;
  items: TFinanceEntry[];
  pagination?: TPagination;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onDelete: (entry: TFinanceEntry) => void;
};

const FinanceEntryListTableSection = ({
  kind,
  items,
  pagination,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onPageChange,
  onDelete,
}: TFinanceEntryListTableSectionProps) => {
  const { t } = useI18n();
  const copyKey = kind === "income" ? "FinancePage.income" : "FinancePage.expense";
  const emptyIcon =
    kind === "income" ? "solar:wad-of-money-linear" : "solar:bill-list-linear";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
        <p className="text-sm font-medium text-ink">{t(`${copyKey}.empty`)}</p>
        <p className="mt-1 text-sm text-muted">{t("FinancePage.table.helperNotFound")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          {t("common.button.retry")}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={emptyIcon} className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">{t(`${copyKey}.empty`)}</p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter ? t("FinancePage.table.helperNotFound") : t(`${copyKey}.helperEmpty`)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable className="min-w-[980px]">
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>{t("FinancePage.table.columns.description")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("FinancePage.table.columns.property")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("FinancePage.table.columns.category")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("FinancePage.table.columns.amount")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("FinancePage.table.columns.occurredAt")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("FinancePage.table.columns.notes")}</DataTableHeaderCell>
            <DataTableHeaderCell className="sticky right-0 z-20 bg-[#f4f7fb] text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)]">
              {t("FinancePage.table.columns.actions")}
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {items.map((entry) => {
            const editHref =
              kind === "income" ? getIncomeEditRoute(entry.id) : getExpenseEditRoute(entry.id);

            return (
              <tr key={entry.id} className="group hover:bg-slate-50/70">
                <DataTableCell className="font-semibold">{entry.description}</DataTableCell>
                <DataTableCell>
                  {entry.property ? (
                    <Link
                      href={getPropertyRoomsRoute(entry.property.id)}
                      className="font-medium text-ink transition hover:text-primary"
                    >
                      {entry.property.name}
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </DataTableCell>
                <DataTableCell>
                  <span className="inline-flex h-7 items-center rounded-lg bg-primary-soft px-2 text-xs font-medium text-primary">
                    {t(`FinancePage.category.${entry.category}`)}
                  </span>
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(entry.amount)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">
                  {formatDate(entry.occurredAt)}
                </DataTableCell>
                <DataTableCell className="max-w-[220px] truncate text-muted">
                  {entry.notes || "—"}
                </DataTableCell>
                <DataTableCell className="sticky right-0 z-10 whitespace-nowrap bg-white text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)] group-hover:bg-slate-50">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      href={editHref}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                    >
                      <Icon icon="solar:pen-linear" className="size-4" />
                      {t("common.button.edit")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                      {t("common.button.delete")}
                    </button>
                  </div>
                </DataTableCell>
              </tr>
            );
          })}
        </DataTableBody>
      </DataTable>
      {pagination ? (
        <PaginationBar pagination={pagination} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
};

export default FinanceEntryListTableSection;
