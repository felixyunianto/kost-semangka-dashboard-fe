"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { Loading } from "@/components/Loading";
import { getPropertyEditRoute, getPropertyRoomsRoute } from "@/lib/constants";
import { formatLateFee } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  PaginationBar,
} from "@/components";

import type { TPagination, TProperty } from "@/lib/entities";

type TPropertyListTableSectionProps = {
  items: TProperty[];
  pagination?: TPagination;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onDelete: (property: TProperty) => void;
};

const getOccupancy = (property: TProperty) => {
  const rooms = property.rooms ?? [];
  const occupied = rooms.filter((room) => room.occupant !== null).length;

  return {
    total: rooms.length,
    occupied,
    available: rooms.length - occupied,
  };
};

const PropertyListTableSection = ({
  items,
  pagination,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onPageChange,
  onDelete,
}: TPropertyListTableSectionProps) => {
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
        <p className="text-sm font-medium text-ink">{t("PropertyPage.table.empty")}</p>
        <p className="mt-1 text-sm text-muted">{t("PropertyPage.table.helperNotFound")}</p>
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
          <Icon icon="solar:home-smile-linear" className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">
          {t("PropertyPage.table.empty")}
        </p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter
            ? t("PropertyPage.table.helperNotFound")
            : t("PropertyPage.table.helperEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>{t("PropertyPage.table.columns.property")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PropertyPage.table.columns.address")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PropertyPage.table.columns.phone")}</DataTableHeaderCell>
            <DataTableHeaderCell>{t("PropertyPage.table.columns.lateFee")}</DataTableHeaderCell>
            <DataTableHeaderCell className="text-center">
              {t("PropertyPage.table.columns.rooms")}
            </DataTableHeaderCell>
            <DataTableHeaderCell className="text-center">
              {t("PropertyPage.table.columns.occupied")}
            </DataTableHeaderCell>
            <DataTableHeaderCell className="text-center">
              {t("PropertyPage.table.columns.available")}
            </DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">
              {t("PropertyPage.table.columns.actions")}
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {items.map((property) => {
            const occupancy = getOccupancy(property);

            return (
              <tr key={property.id} className="hover:bg-slate-50/70">
                <DataTableCell>
                  <Link
                    href={getPropertyRoomsRoute(property.id)}
                    className="font-semibold text-ink transition hover:text-primary"
                  >
                    {property.name}
                  </Link>
                </DataTableCell>
                <DataTableCell className="max-w-64 truncate text-muted">
                  {property.address}
                </DataTableCell>
                <DataTableCell className="text-muted">
                  {property.phone || "—"}
                </DataTableCell>
                <DataTableCell>{formatLateFee(property.setting)}</DataTableCell>
                <DataTableCell className="text-center">{occupancy.total}</DataTableCell>
                <DataTableCell className="text-center">{occupancy.occupied}</DataTableCell>
                <DataTableCell className="text-center">{occupancy.available}</DataTableCell>
                <DataTableCell className="text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      href={getPropertyEditRoute(property.id)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
                    >
                      <Icon icon="solar:pen-linear" className="size-4" />
                      {t("common.button.edit")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(property)}
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

export default PropertyListTableSection;
