"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { CurrencyInput, Select, TextInput } from "@/components";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  INVENTORY_CONDITIONS,
  INVENTORY_STATUSES,
  type TInventoryCondition,
  type TInventoryStatus,
  type TRoomListPageFilter,
} from "@/lib/entities";

type TRoomListFilterSectionProps = {
  filter: TRoomListPageFilter;
  onFilterChange: (filter: TRoomListPageFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  canReset: boolean;
  isSearching?: boolean;
};

const RoomListFilterSection = ({
  filter,
  onFilterChange,
  onSearch,
  onReset,
  canReset,
  isSearching,
}: TRoomListFilterSectionProps) => {
  const { t } = useI18n();
  const hasAdvancedFilter = Boolean(
    filter.minPrice?.trim() ||
    filter.maxPrice?.trim() ||
    filter.minLength?.trim() ||
    filter.maxLength?.trim() ||
    filter.minWidth?.trim() ||
    filter.maxWidth?.trim() ||
    filter.inventoryStatus ||
    filter.inventoryCondition,
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasAdvancedFilter);

  const updateFilter = (patch: Partial<TRoomListPageFilter>) => {
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
        <TextInput
          id="room-occupant-name-filter"
          label={t("RoomPage.filter.occupantName")}
          placeholder={t("RoomPage.filter.occupantNamePlaceholder")}
          value={filter.occupantName ?? ""}
          startIcon="solar:user-linear"
          onChange={(event) => {
            updateFilter({ occupantName: event.target.value });
          }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2">
            <TextInput
              id="room-name-filter"
              label={t("RoomPage.filter.name")}
              placeholder={t("RoomPage.filter.placeholder")}
              value={filter.name ?? ""}
              startIcon="solar:magnifer-linear"
              onChange={(event) => {
                updateFilter({ name: event.target.value });
              }}
            />
          </div>
          <Select
            id="room-status-filter"
            label={t("RoomPage.filter.status")}
            value={filter.status ?? ""}
            onChange={(event) => {
              updateFilter({
                status: event.target.value as TRoomListPageFilter["status"],
              });
            }}
          >
            <option value="">{t("RoomPage.filter.statusAll")}</option>
            <option value="available">{t("RoomPage.filter.available")}</option>
            <option value="occupied">{t("RoomPage.filter.occupied")}</option>
          </Select>
          <TextInput
            id="room-inventories-filter"
            label={t("RoomPage.filter.inventories")}
            placeholder={t("RoomPage.filter.inventoriesPlaceholder")}
            value={filter.inventories ?? ""}
            onChange={(event) => {
              updateFilter({ inventories: event.target.value });
            }}
          />
        </div>
        {isAdvancedOpen ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CurrencyInput
              id="room-min-price-filter"
              label={t("RoomPage.filter.minPrice")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.minPrice ?? ""}
              onValueChange={(value) => {
                updateFilter({ minPrice: value });
              }}
            />
            <CurrencyInput
              id="room-max-price-filter"
              label={t("RoomPage.filter.maxPrice")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.maxPrice ?? ""}
              onValueChange={(value) => {
                updateFilter({ maxPrice: value });
              }}
            />
            <TextInput
              id="room-min-length-filter"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              label={t("RoomPage.filter.minLength")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.minLength ?? ""}
              onChange={(event) => {
                updateFilter({ minLength: event.target.value });
              }}
            />
            <TextInput
              id="room-max-length-filter"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              label={t("RoomPage.filter.maxLength")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.maxLength ?? ""}
              onChange={(event) => {
                updateFilter({ maxLength: event.target.value });
              }}
            />
            <TextInput
              id="room-min-width-filter"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              label={t("RoomPage.filter.minWidth")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.minWidth ?? ""}
              onChange={(event) => {
                updateFilter({ minWidth: event.target.value });
              }}
            />
            <TextInput
              id="room-max-width-filter"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              label={t("RoomPage.filter.maxWidth")}
              placeholder={t("RoomPage.filter.numberPlaceholder")}
              value={filter.maxWidth ?? ""}
              onChange={(event) => {
                updateFilter({ maxWidth: event.target.value });
              }}
            />
            <Select
              id="room-inventory-condition-filter"
              label={t("RoomPage.filter.inventoryCondition")}
              value={filter.inventoryCondition ?? ""}
              onChange={(event) => {
                updateFilter({
                  inventoryCondition: event.target.value as
                    | TInventoryCondition
                    | "",
                });
              }}
            >
              <option value="">
                {t("RoomPage.filter.inventoryConditionAll")}
              </option>
              {INVENTORY_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {t(`RoomPage.inventoryCondition.${condition}`)}
                </option>
              ))}
            </Select>
            <Select
              id="room-inventory-status-filter"
              label={t("RoomPage.filter.inventoryStatus")}
              value={filter.inventoryStatus ?? ""}
              onChange={(event) => {
                updateFilter({
                  inventoryStatus: event.target.value as TInventoryStatus | "",
                });
              }}
            >
              <option value="">
                {t("RoomPage.filter.inventoryStatusAll")}
              </option>
              {INVENTORY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`RoomPage.inventoryStatus.${status}`)}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
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
              ? t("RoomPage.filter.lessFilters")
              : t("RoomPage.filter.moreFilters")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomListFilterSection;
