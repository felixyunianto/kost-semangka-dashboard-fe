"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Loading } from "@/components/Loading";
import { getBillEditRoute, getOccupantEditRoute, getPropertyRoomsRoute } from "@/lib/constants";
import { canCancelBill, canEditManualBill, canMarkPaidCash } from "@/lib/entities";
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

import type { TBill, TBillStatus, TPagination } from "@/lib/entities";

type TBillListTableSectionProps = {
  items: TBill[];
  pagination?: TPagination;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onCancel: (bill: TBill) => void;
  onMarkPaidCash: (bill: TBill) => void;
};

const statusClassName = (status: TBillStatus) => {
  if (status === "PAID") {
    return "bg-primary-soft text-primary";
  }

  if (status === "OVERDUE") {
    return "bg-red-50 text-red-600";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-muted";
};

const formatPeriod = (start?: string | null, end?: string | null) => {
  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  return formatDate(start || end);
};

const BillListTableSection = ({
  items,
  pagination,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onPageChange,
  onCancel,
  onMarkPaidCash,
}: TBillListTableSectionProps) => {
  const { t } = useI18n();

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
        <p className="text-sm font-medium text-ink">{t("BillPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">{t("BillPage.table.helperNotFound")}</p>
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
          <Icon icon="solar:document-text-linear" className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">{t("BillPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter ? t("BillPage.table.helperNotFound") : t("BillPage.table.helperEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable className="min-w-[1320px]">
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>{t("BillPage.table.columns.invoice")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.occupant")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.property")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.room")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.type")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.status")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.amount")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.lateFee")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.payable")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.dueDate")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("BillPage.table.columns.period")}</DataTableHeaderCell>
            <DataTableHeaderCell className="sticky right-0 z-20 bg-[#f4f7fb] text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)]">
              {t("BillPage.table.columns.actions")}
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {items.map((bill) => {
            const occupant = bill.occupant;
            const property = occupant?.room?.property;
            const payable = bill.payableAmount ?? Number(bill.amount) + Number(bill.lateFeeAmount || 0);

            return (
              <tr key={bill.id} className="group hover:bg-slate-50/70">
                <DataTableCell className="whitespace-nowrap font-semibold">
                  {bill.invoiceNumber}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">
                  {occupant ? (
                    <Link
                      href={getOccupantEditRoute(occupant.id)}
                      className="font-medium text-ink transition hover:text-primary"
                    >
                      {occupant.fullName}
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">
                  {property ? (
                    <Link
                      href={getPropertyRoomsRoute(property.id)}
                      className="font-medium text-ink transition hover:text-primary"
                    >
                      {property.name}
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {occupant?.room?.name || "—"}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {t(`BillPage.type.${bill.type}`)}
                </DataTableCell>
                <DataTableCell>
                  <span
                    className={classNames(
                      "inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium",
                      statusClassName(bill.status),
                    )}
                  >
                    {t(`BillPage.status.${bill.status}`)}
                  </span>
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">
                  {formatCurrency(bill.amount)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {formatCurrency(bill.lateFeeAmount || 0)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap font-semibold">
                  {formatCurrency(payable)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap">{formatDate(bill.dueDate)}</DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {formatPeriod(bill.periodStart, bill.periodEnd)}
                </DataTableCell>
                <DataTableCell className="sticky right-0 z-10 whitespace-nowrap bg-white text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)] group-hover:bg-slate-50">
                  {canEditManualBill(bill) || canMarkPaidCash(bill) || canCancelBill(bill) ? (
                    <div className="inline-flex items-center justify-end gap-1">
                      {canEditManualBill(bill) ? (
                        <Link
                          href={getBillEditRoute(bill.id)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                        >
                          <Icon icon="solar:pen-linear" className="size-4" />
                          {t("common.button.edit")}
                        </Link>
                      ) : null}
                      {canMarkPaidCash(bill) ? (
                        <button
                          type="button"
                          onClick={() => onMarkPaidCash(bill)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                        >
                          <Icon icon="solar:wad-of-money-linear" className="size-4" />
                          {t("BillPage.payCash.confirm")}
                        </button>
                      ) : null}
                      {canCancelBill(bill) ? (
                        <button
                          type="button"
                          onClick={() => onCancel(bill)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Icon icon="solar:close-circle-linear" className="size-4" />
                          {t("common.button.cancel")}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
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

export default BillListTableSection;
