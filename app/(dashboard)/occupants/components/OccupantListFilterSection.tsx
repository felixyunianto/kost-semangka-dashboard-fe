"use client";

import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Select, TextInput } from "@/components";
import { GET_PROPERTY_LIST_QUERY_KEY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperties } from "@/lib/services";

import type { TOccupantListPageFilter } from "@/lib/entities";

type TOccupantListFilterSectionProps = {
  filter: TOccupantListPageFilter;
  onFilterChange: (filter: TOccupantListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
};

const OccupantListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
}: TOccupantListFilterSectionProps) => {
  const { t } = useI18n();
  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });
  const properties = propertiesQuery.data?.items ?? [];

  const updateFilter = (patch: Partial<TOccupantListPageFilter>) => {
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
            id="occupant-name-filter"
            label={t("OccupantPage.filter.name")}
            placeholder={t("OccupantPage.filter.placeholder")}
            value={filter.name ?? ""}
            startIcon="solar:magnifer-linear"
            onChange={(event) => {
              updateFilter({ name: event.target.value });
            }}
          />
          <Select
            id="occupant-property-filter"
            label={t("OccupantPage.filter.property")}
            value={filter.propertyId ?? ""}
            onChange={(event) => {
              updateFilter({ propertyId: event.target.value });
            }}
          >
            <option value="">{t("OccupantPage.filter.propertyAll")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            id="occupant-status-filter"
            label={t("OccupantPage.filter.status")}
            value={filter.isActive ?? ""}
            onChange={(event) => {
              updateFilter({
                isActive: event.target.value as TOccupantListPageFilter["isActive"],
              });
            }}
          >
            <option value="">{t("OccupantPage.filter.statusAll")}</option>
            <option value="true">{t("OccupantPage.filter.active")}</option>
            <option value="false">{t("OccupantPage.filter.inactive")}</option>
          </Select>
          <TextInput
            id="occupant-check-in-from-filter"
            type="date"
            label={t("OccupantPage.filter.checkInFrom")}
            value={filter.checkInFrom ?? ""}
            onChange={(event) => {
              updateFilter({ checkInFrom: event.target.value });
            }}
          />
          <TextInput
            id="occupant-check-in-to-filter"
            type="date"
            label={t("OccupantPage.filter.checkInTo")}
            value={filter.checkInTo ?? ""}
            onChange={(event) => {
              updateFilter({ checkInTo: event.target.value });
            }}
          />
        </div>
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

export default OccupantListFilterSection;
