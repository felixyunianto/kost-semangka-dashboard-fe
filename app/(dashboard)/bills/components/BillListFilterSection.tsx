"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Select, TextInput } from "@/components";
import { GET_PROPERTY_LIST_QUERY_KEY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperties } from "@/lib/services";

import type { TBillListPageFilter, TBillStatus, TBillType } from "@/lib/entities";

type TBillListFilterSectionProps = {
  filter: TBillListPageFilter;
  onFilterChange: (filter: TBillListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
};

const BILL_STATUSES: TBillStatus[] = ["UNPAID", "PENDING", "PAID", "OVERDUE", "CANCELLED"];
const BILL_TYPES: TBillType[] = ["RENT", "MANUAL", "BOOKING"];

const BillListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
}: TBillListFilterSectionProps) => {
  const { t } = useI18n();
  const hasAdvancedFilter = Boolean(
    filter.type || filter.dueDateFrom?.trim() || filter.dueDateTo?.trim(),
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasAdvancedFilter);

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });
  const properties = propertiesQuery.data?.items ?? [];

  const updateFilter = (patch: Partial<TBillListPageFilter>) => {
    onFilterChange({
      ...filter,
      ...patch,
    });
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-5">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TextInput
            id="bill-invoice-filter"
            label={t("BillPage.filter.invoiceNumber")}
            placeholder={t("BillPage.filter.invoicePlaceholder")}
            value={filter.invoiceNumber ?? ""}
            startIcon="solar:magnifer-linear"
            onChange={(event) => {
              updateFilter({ invoiceNumber: event.target.value });
            }}
          />
          <TextInput
            id="bill-occupant-filter"
            label={t("BillPage.filter.occupantName")}
            placeholder={t("BillPage.filter.occupantPlaceholder")}
            value={filter.occupantName ?? ""}
            onChange={(event) => {
              updateFilter({ occupantName: event.target.value });
            }}
          />
          <Select
            id="bill-property-filter"
            label={t("BillPage.filter.property")}
            value={filter.propertyId ?? ""}
            onChange={(event) => {
              updateFilter({ propertyId: event.target.value });
            }}
          >
            <option value="">{t("BillPage.filter.propertyAll")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            id="bill-status-filter"
            label={t("BillPage.filter.status")}
            value={filter.status ?? ""}
            onChange={(event) => {
              updateFilter({
                status: event.target.value as TBillListPageFilter["status"],
              });
            }}
          >
            <option value="">{t("BillPage.filter.statusAll")}</option>
            {BILL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`BillPage.status.${status}`)}
              </option>
            ))}
          </Select>
        </div>
        {isAdvancedOpen ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Select
              id="bill-type-filter"
              label={t("BillPage.filter.type")}
              value={filter.type ?? ""}
              onChange={(event) => {
                updateFilter({
                  type: event.target.value as TBillListPageFilter["type"],
                });
              }}
            >
              <option value="">{t("BillPage.filter.typeAll")}</option>
              {BILL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`BillPage.type.${type}`)}
                </option>
              ))}
            </Select>
            <TextInput
              id="bill-due-from-filter"
              type="date"
              label={t("BillPage.filter.dueDateFrom")}
              value={filter.dueDateFrom ?? ""}
              onChange={(event) => {
                updateFilter({ dueDateFrom: event.target.value });
              }}
            />
            <TextInput
              id="bill-due-to-filter"
              type="date"
              label={t("BillPage.filter.dueDateTo")}
              value={filter.dueDateTo ?? ""}
              onChange={(event) => {
                updateFilter({ dueDateTo: event.target.value });
              }}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
          >
            <Icon icon="solar:magnifer-linear" className="size-5" />
            {t("common.search")}
          </button>
          <button
            type="button"
            disabled={!canReset || isSearching}
            onClick={onReset}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            <Icon icon="solar:restart-linear" className="size-5" />
            {t("common.button.reset")}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdvancedOpen((open) => !open);
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-1 text-sm font-semibold text-primary transition hover:text-primary-hover sm:ml-auto"
          >
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={classNames("size-5 transition", isAdvancedOpen && "rotate-180")}
            />
            {isAdvancedOpen ? t("BillPage.filter.lessFilters") : t("BillPage.filter.moreFilters")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillListFilterSection;
