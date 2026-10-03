"use client";

import { Icon } from "@iconify/react";

import { Select, TextInput } from "@/components";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TPropertyListPageFilter } from "@/lib/entities";

type TPropertyListFilterSectionProps = {
  filter: TPropertyListPageFilter;
  onFilterChange: (filter: TPropertyListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
};

const PropertyListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
}: TPropertyListFilterSectionProps) => {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-5">
      <form
        className="flex flex-col gap-4 lg:flex-row lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <div className="min-w-0 flex-1">
          <TextInput
            id="property-name-filter"
            label={t("PropertyPage.filter.name")}
            placeholder={t("PropertyPage.filter.placeholder")}
            value={filter.name ?? ""}
            startIcon="solar:magnifer-linear"
            onChange={(event) => {
              onFilterChange({
                ...filter,
                name: event.target.value,
              });
            }}
          />
        </div>
        <div className="w-full lg:w-52">
          <Select
            id="property-late-fee-filter"
            label={t("PropertyPage.filter.lateFee")}
            value={filter.lateFee ?? ""}
            onChange={(event) => {
              onFilterChange({
                ...filter,
                lateFee: event.target.value,
              });
            }}
          >
            <option value="">{t("PropertyPage.filter.lateFeeAll")}</option>
            <option value="true">{t("PropertyPage.filter.lateFeeOn")}</option>
            <option value="false">{t("PropertyPage.filter.lateFeeOff")}</option>
          </Select>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 lg:flex-none"
          >
            <Icon icon="solar:magnifer-linear" className="size-5" />
            {t("common.search")}
          </button>
          <button
            type="button"
            disabled={!canReset || isSearching}
            onClick={onReset}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
          >
            <Icon icon="solar:restart-linear" className="size-5" />
            {t("common.button.reset")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyListFilterSection;
