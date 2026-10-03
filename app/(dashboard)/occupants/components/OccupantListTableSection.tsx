"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Loading } from "@/components/Loading";
import { getOccupantEditRoute, getPropertyRoomsRoute } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  PaginationBar,
} from "@/components";

import type { TOccupant, TPagination } from "@/lib/entities";

type TOccupantListTableSectionProps = {
  items: TOccupant[];
  pagination?: TPagination;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onCheckout: (occupant: TOccupant) => void;
  onDelete: (occupant: TOccupant) => void;
  onDetail: (occupant: TOccupant) => void;
};

const OccupantListTableSection = ({
  items,
  pagination,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onPageChange,
  onCheckout,
  onDelete,
  onDetail,
}: TOccupantListTableSectionProps) => {
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
        <p className="text-sm font-medium text-ink">{t("OccupantPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">{t("OccupantPage.table.helperNotFound")}</p>
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
          <Icon icon="solar:users-group-rounded-linear" className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">{t("OccupantPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter
            ? t("OccupantPage.table.helperNotFound")
            : t("OccupantPage.table.helperEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable className="min-w-[1180px]">
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.occupant")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.email")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.phone")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.property")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.room")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.checkIn")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.checkOut")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("OccupantPage.table.columns.status")}</DataTableHeaderCell>
            <DataTableHeaderCell className="sticky right-0 z-20 bg-[#f4f7fb] text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)]">
              {t("OccupantPage.table.columns.actions")}
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {items.map((occupant) => {
            const property = occupant.room?.property;

            return (
              <tr key={occupant.id} className="group hover:bg-slate-50/70">
                <DataTableCell className="whitespace-nowrap font-semibold">
                  <button
                    type="button"
                    onClick={() => onDetail(occupant)}
                    className="text-left transition hover:text-primary"
                  >
                    {occupant.fullName}
                  </button>
                </DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">{occupant.email}</DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">{occupant.phone || "—"}</DataTableCell>
                <DataTableCell>
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
                <DataTableCell className="whitespace-nowrap text-muted">{occupant.room?.name || "—"}</DataTableCell>
                <DataTableCell className="whitespace-nowrap">{formatDate(occupant.checkIn)}</DataTableCell>
                <DataTableCell className="whitespace-nowrap text-muted">{formatDate(occupant.checkOut)}</DataTableCell>
                <DataTableCell>
                  <span
                    className={classNames(
                      "inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium",
                      occupant.isActive
                        ? "bg-primary-soft text-primary"
                        : "bg-slate-100 text-muted",
                    )}
                  >
                    {occupant.isActive
                      ? t("OccupantPage.filter.active")
                      : t("OccupantPage.filter.inactive")}
                  </span>
                </DataTableCell>
                <DataTableCell className="sticky right-0 z-10 whitespace-nowrap bg-white text-right shadow-[-12px_0_16px_-12px_rgba(16,36,61,0.22)] group-hover:bg-slate-50">
                  <div className="inline-flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDetail(occupant)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink transition hover:bg-slate-100"
                    >
                      <Icon icon="solar:eye-linear" className="size-4" />
                      {t("common.button.detail")}
                    </button>
                    <Link
                      href={getOccupantEditRoute(occupant.id)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                    >
                      <Icon icon="solar:pen-linear" className="size-4" />
                      {t("common.button.edit")}
                    </Link>
                    {occupant.isActive ? (
                      <button
                        type="button"
                        onClick={() => onCheckout(occupant)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                      >
                        <Icon icon="solar:logout-2-linear" className="size-4" />
                        {t("OccupantPage.table.checkout")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onDelete(occupant)}
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

export default OccupantListTableSection;
