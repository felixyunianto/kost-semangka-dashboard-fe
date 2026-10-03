"use client";

import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Select, TextInput } from "@/components";
import { GET_FINANCE_CATEGORIES_QUERY_KEY, GET_PROPERTY_LIST_QUERY_KEY } from "@/lib/constants";
import { FINANCE_CATEGORIES } from "@/lib/entities";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFinanceCategories, getProperties } from "@/lib/services";

import type { TFinanceCategory, TFinanceEntryListPageFilter } from "@/lib/entities";

type TFinanceEntryListFilterSectionProps = {
  filter: TFinanceEntryListPageFilter;
  onFilterChange: (filter: TFinanceEntryListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
  error?: string;
};

const FinanceEntryListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
  error,
}: TFinanceEntryListFilterSectionProps) => {
  const { t } = useI18n();
  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });
  const categoriesQuery = useQuery({
    queryKey: GET_FINANCE_CATEGORIES_QUERY_KEY,
    queryFn: getFinanceCategories,
  });

  const properties = propertiesQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? FINANCE_CATEGORIES;

  const updateFilter = (patch: Partial<TFinanceEntryListPageFilter>) => {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TextInput
            id="finance-description-filter"
            label={t("FinancePage.filter.description")}
            placeholder={t("FinancePage.filter.descriptionPlaceholder")}
            value={filter.description ?? ""}
            startIcon="solar:magnifer-linear"
            onChange={(event) => {
              updateFilter({ description: event.target.value });
            }}
          />
          <Select
            id="finance-property-filter"
            label={t("FinancePage.filter.property")}
            value={filter.propertyId ?? ""}
            onChange={(event) => {
              updateFilter({ propertyId: event.target.value });
            }}
          >
            <option value="">{t("FinancePage.filter.propertyAll")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            id="finance-category-filter"
            label={t("FinancePage.filter.category")}
            value={filter.category ?? ""}
            onChange={(event) => {
              updateFilter({
                category: event.target.value as TFinanceCategory | "",
              });
            }}
          >
            <option value="">{t("FinancePage.filter.categoryAll")}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {t(`FinancePage.category.${category}`)}
              </option>
            ))}
          </Select>
          <TextInput
            id="finance-occurred-from-filter"
            type="date"
            label={t("FinancePage.filter.occurredFrom")}
            value={filter.occurredFrom ?? ""}
            onChange={(event) => {
              updateFilter({ occurredFrom: event.target.value });
            }}
          />
          <TextInput
            id="finance-occurred-to-filter"
            type="date"
            label={t("FinancePage.filter.occurredTo")}
            value={filter.occurredTo ?? ""}
            onChange={(event) => {
              updateFilter({ occurredTo: event.target.value });
            }}
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex shrink-0 gap-2">
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
        </div>
      </form>
    </div>
  );
};

export default FinanceEntryListFilterSection;
