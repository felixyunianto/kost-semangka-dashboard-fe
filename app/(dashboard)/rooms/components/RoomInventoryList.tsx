"use client";

import { Icon } from "@iconify/react";
import classNames from "classnames";

import { applyInventoryHealth, getInventoryIcon, isInventoryRepairing } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TRoomInventory } from "@/lib/entities";

type TRoomInventoryListProps = {
  items: TRoomInventory[];
  onChange: (items: TRoomInventory[]) => void;
  onRemove?: (index: number) => void;
};

const HealthPill = ({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition",
        selected
          ? "border-primary/25 bg-white text-ink"
          : "border-slate-200 bg-white text-muted hover:border-slate-300",
      )}
    >
      <span
        className={classNames(
          "size-2.5 rounded-full border",
          selected ? "border-primary bg-primary" : "border-slate-300 bg-white",
        )}
      />
      {children}
    </button>
  );
};

export function RoomInventoryList({ items, onChange, onRemove }: TRoomInventoryListProps) {
  const { t } = useI18n();

  if (items.length === 0) {
    return <p className="py-6 text-sm text-muted">{t("RoomPage.form.inventoryEmpty")}</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, index) => {
        const needsRepair = isInventoryRepairing(item);

        return (
          <div
            key={item.id ?? `inventory-${index}`}
            className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Icon
                icon={getInventoryIcon(item.name)}
                className="size-5 shrink-0 text-slate-400"
              />
              <p className="min-w-0 truncate text-sm font-medium text-ink">{item.name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <HealthPill
                selected={!needsRepair}
                onClick={() => {
                  onChange(
                    items.map((current, itemIndex) =>
                      itemIndex === index ? applyInventoryHealth(current, false) : current,
                    ),
                  );
                }}
              >
                {t("RoomPage.form.inventoryGood")}
              </HealthPill>
              <HealthPill
                selected={needsRepair}
                onClick={() => {
                  onChange(
                    items.map((current, itemIndex) =>
                      itemIndex === index ? applyInventoryHealth(current, true) : current,
                    ),
                  );
                }}
              >
                {t("RoomPage.form.inventoryRepair")}
              </HealthPill>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => {
                    onRemove(index);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`${t("common.button.delete")} ${item.name}`}
                >
                  <Icon icon="solar:close-circle-linear" className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
