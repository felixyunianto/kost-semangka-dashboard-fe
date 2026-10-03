"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Select, TextInput } from "@/components";
import { GET_PROPERTY_LIST_QUERY_KEY } from "@/lib/constants";
import { PAYMENT_GATEWAYS, PAYMENT_STATUSES } from "@/lib/entities";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperties } from "@/lib/services";

import type { TPaymentListPageFilter } from "@/lib/entities";

type TPaymentListFilterSectionProps = {
  filter: TPaymentListPageFilter;
  onFilterChange: (filter: TPaymentListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
  error?: string;
};

const PaymentListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
  error,
}: TPaymentListFilterSectionProps) => {
  const { t } = useI18n();
  const hasAdvancedFilter = Boolean(
    filter.gateway || filter.paidFrom?.trim() || filter.paidTo?.trim(),
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasAdvancedFilter);

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });
  const properties = propertiesQuery.data?.items ?? [];

  const updateFilter = (patch: Partial<TPaymentListPageFilter>) => {
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
            id="payment-invoice-filter"
            label={t("PaymentPage.filter.invoiceNumber")}
            placeholder={t("PaymentPage.filter.invoicePlaceholder")}
            value={filter.invoiceNumber ?? ""}
            startIcon="solar:magnifer-linear"
            onChange={(event) => {
              updateFilter({ invoiceNumber: event.target.value });
            }}
          />
          <TextInput
            id="payment-occupant-filter"
            label={t("PaymentPage.filter.occupantName")}
            placeholder={t("PaymentPage.filter.occupantPlaceholder")}
            value={filter.occupantName ?? ""}
            onChange={(event) => {
              updateFilter({ occupantName: event.target.value });
            }}
          />
          <Select
            id="payment-property-filter"
            label={t("PaymentPage.filter.property")}
            value={filter.propertyId ?? ""}
            onChange={(event) => {
              updateFilter({ propertyId: event.target.value });
            }}
          >
            <option value="">{t("PaymentPage.filter.propertyAll")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            id="payment-status-filter"
            label={t("PaymentPage.filter.status")}
            value={filter.status ?? ""}
            onChange={(event) => {
              updateFilter({
                status: event.target.value as TPaymentListPageFilter["status"],
              });
            }}
          >
            <option value="">{t("PaymentPage.filter.statusAll")}</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`PaymentPage.status.${status}`)}
              </option>
            ))}
          </Select>
        </div>
        {isAdvancedOpen ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Select
              id="payment-gateway-filter"
              label={t("PaymentPage.filter.gateway")}
              value={filter.gateway ?? ""}
              onChange={(event) => {
                updateFilter({
                  gateway: event.target
                    .value as TPaymentListPageFilter["gateway"],
                });
              }}
            >
              <option value="">{t("PaymentPage.filter.gatewayAll")}</option>
              {PAYMENT_GATEWAYS.map((gateway) => (
                <option key={gateway} value={gateway}>
                  {t(`PaymentPage.gateway.${gateway}`)}
                </option>
              ))}
            </Select>
            <TextInput
              id="payment-paid-from-filter"
              type="date"
              label={t("PaymentPage.filter.paidFrom")}
              value={filter.paidFrom ?? ""}
              onChange={(event) => {
                updateFilter({ paidFrom: event.target.value });
              }}
            />
            <TextInput
              id="payment-paid-to-filter"
              type="date"
              label={t("PaymentPage.filter.paidTo")}
              value={filter.paidTo ?? ""}
              onChange={(event) => {
                updateFilter({ paidTo: event.target.value });
              }}
            />
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon icon="solar:magnifer-linear" className="size-5" />
              {t("common.search")}
            </button>
            <button
              type="button"
              disabled={!canReset || isSearching}
              onClick={onReset}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="solar:restart-linear" className="size-5" />
              {t("common.button.reset")}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAdvancedOpen((open) => !open);
            }}
            className="inline-flex h-12 items-center justify-center sm:justify-start gap-2 rounded-xl px-1 text-sm font-semibold text-primary transition hover:text-primary-hover sm:ml-auto"
          >
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={classNames(
                "size-5 transition",
                isAdvancedOpen && "rotate-180",
              )}
            />
            {isAdvancedOpen
              ? t("PaymentPage.filter.lessFilters")
              : t("PaymentPage.filter.moreFilters")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentListFilterSection;
