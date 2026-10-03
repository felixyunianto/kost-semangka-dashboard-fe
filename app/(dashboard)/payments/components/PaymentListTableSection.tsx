"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { Loading } from "@/components/Loading";
import {
  getOccupantEditRoute,
  getPaymentDetailRoute,
  getPropertyRoomsRoute,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  PaginationBar,
} from "@/components";

import { PaymentStatusBadge } from "./PaymentStatusBadge";

import type { TPagination, TPayment } from "@/lib/entities";

type TPaymentListTableSectionProps = {
  items: TPayment[];
  pagination?: TPagination;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
};

const PaymentListTableSection = ({
  items,
  pagination,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onPageChange,
}: TPaymentListTableSectionProps) => {
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
        <p className="text-sm font-medium text-ink">{t("PaymentPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">{t("PaymentPage.table.helperNotFound")}</p>
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
          <Icon icon="solar:wallet-2-linear" className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">{t("PaymentPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter
            ? t("PaymentPage.table.helperNotFound")
            : t("PaymentPage.table.helperEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable className="min-w-[1180px]">
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.invoice")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.occupant")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.property")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.room")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.gateway")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.status")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.amount")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.paidAt")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PaymentPage.table.columns.expiredAt")}</DataTableHeaderCell>
            <DataTableHeaderCell className="sticky right-0 z-20 bg-[#f4f7fb] text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)]">
              {t("PaymentPage.table.columns.actions")}
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {items.map((payment) => {
            const occupant = payment.bill?.occupant;
            const property = occupant?.room?.property;
            const gatewayKey = `PaymentPage.gateway.${payment.gateway}`;
            const gatewayLabel = t(gatewayKey);

            return (
              <tr key={payment.id} className="group hover:bg-slate-50/70">
                <DataTableCell className="whitespace-nowrap font-semibold">
                  {payment.bill?.invoiceNumber || "—"}
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
                  {gatewayLabel === gatewayKey ? payment.gateway : gatewayLabel}
                </DataTableCell>
                <DataTableCell>
                  <PaymentStatusBadge status={payment.status} />
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(payment.amount)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {formatDateTime(payment.paidAt)}
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">
                  {formatDateTime(payment.expiredAt)}
                </DataTableCell>
                <DataTableCell className="sticky right-0 z-10 whitespace-nowrap bg-white text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)] group-hover:bg-slate-50">
                  <Link
                    href={getPaymentDetailRoute(payment.id)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                  >
                    <Icon icon="solar:eye-linear" className="size-4" />
                    {t("PaymentPage.view")}
                  </Link>
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

export default PaymentListTableSection;
