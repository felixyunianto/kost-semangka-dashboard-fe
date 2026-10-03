"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { RoomInventoryList } from "./RoomInventoryList";
import { formatCurrency } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type {
  TRoom,
  TRoomInventory,
  TRoomInventoryPayload,
} from "@/lib/entities";
import Link from "next/link";
import { getRoomEditRoute } from "@/lib/constants";

type TRoomInventoryDialogProps = {
  room: TRoom | null;
  isSaving?: boolean;
  error?: string;
  onCancel: () => void;
  onSave: (inventories: TRoomInventoryPayload[]) => void;
  onDelete: (room: TRoom) => void;
};

const toInventories = (room: TRoom): TRoomInventory[] => {
  return (room.inventories ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    condition: item.condition,
    status: item.status ?? "FUNCTIONAL",
  }));
};

const formatRoomSize = (room: TRoom) => {
  if (room.length == null && room.width == null) {
    return null;
  }

  return `${room.length ?? "—"} × ${room.width ?? "—"}`;
};

const RoomInventoryDialog = ({
  room,
  isSaving,
  error,
  onCancel,
  onSave,
  onDelete,
}: TRoomInventoryDialogProps) => {
  const { t } = useI18n();
  const [items, setItems] = useState<TRoomInventory[]>([]);

  useEffect(() => {
    if (room) {
      setItems(toInventories(room));
    }
  }, [room]);

  if (!room) {
    return null;
  }

  const isOccupied = room.isAvailable === false;
  const occupantName = room.occupantName || room.occupant?.fullName;
  const roomSize = formatRoomSize(room);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={() => {
        if (!isSaving) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-detail-title"
        className="flex max-h-[min(88vh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-24px_rgba(16,36,61,0.35)]"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="overflow-y-auto px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="room-detail-title"
                className="text-xl font-semibold tracking-tight text-ink"
              >
                {room.name}
              </h2>
              <span
                className={classNames(
                  "mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase",
                  isOccupied ? "text-muted" : "text-primary",
                )}
              >
                <span
                  className={classNames(
                    "size-1.5 rounded-full",
                    isOccupied ? "bg-slate-400" : "bg-primary",
                  )}
                />
                {isOccupied
                  ? t("RoomPage.filter.occupied")
                  : t("RoomPage.filter.available")}
              </span>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-muted transition hover:bg-slate-50 disabled:opacity-70"
              aria-label={t("common.button.cancel")}
            >
              <Icon icon="solar:close-circle-linear" className="size-5" />
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("RoomPage.table.columns.type")}</dt>
              <dd className="mt-1 font-medium text-ink">{room.type || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("RoomPage.table.columns.size")}</dt>
              <dd className="mt-1 font-medium text-ink">{roomSize ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">
                {t("RoomPage.table.columns.price")}
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatCurrency(room.price)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">
                {t("RoomPage.table.columns.occupant")}
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {occupantName || t("RoomPage.table.vacant")}
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-sm text-muted">
            {t("RoomPage.form.inventorySection")}
          </p>

          <div className="mt-2">
            <RoomInventoryList items={items} onChange={setItems} />
          </div>

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="px-6 pt-4 pb-6">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              onSave(
                items
                  .map((item) => ({
                    name: item.name.trim(),
                    condition: item.condition,
                    status: item.status,
                  }))
                  .filter((item) => item.name.length > 0),
              );
            }}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("RoomPage.form.inventorySaveChanges")}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Link
              type="button"
              href={getRoomEditRoute(room.propertyId, room.id)}
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-primary-light text-sm font-semibold text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70 flex items-center gap-2 hover:text-white"
            >
              <Icon icon="solar:pen-linear" className="size-4" />
              {t("common.button.edit")}
            </Link>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                onDelete(room)
              }}
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-red-400 text-sm font-semibold text-red-600 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70 flex items-center gap-2 hover:text-white"
            >
              <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
              {t("common.button.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInventoryDialog;
