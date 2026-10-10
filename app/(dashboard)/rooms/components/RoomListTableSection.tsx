"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Loading } from "@/components/Loading";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
} from "@/components";

import type { TRoom, TRoomInventory } from "@/lib/entities";

type TRentStatusKey = NonNullable<TRoom["rentStatus"]> | "NONE";

const RENT_STATUS_STYLE: Record<TRentStatusKey, { dot: string; text: string }> = {
  PAID: { dot: "bg-emerald-500", text: "text-emerald-700" },
  UNPAID: { dot: "bg-amber-400", text: "text-amber-700" },
  // PENDING = QR/VA sudah dikirim, menunggu dibayar (bukan "sedang diproses")
  PENDING: { dot: "bg-amber-400", text: "text-amber-700" },
  OVERDUE: { dot: "bg-red-500", text: "text-red-600" },
  NONE: { dot: "bg-slate-300", text: "text-slate-500" },
};

type TRoomListTableSectionProps = {
  items: TRoom[];
  propertyId: string;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onRetry: () => void;
  onDetail: (room: TRoom) => void;
};


const RoomListTableSection = ({
  items,
  propertyId,
  isLoading,
  isError,
  hasFilter,
  onRetry,
  onDetail,
}: TRoomListTableSectionProps) => {
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
        <p className="text-sm font-medium text-ink">
          {t("RoomPage.table.empty")}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t("RoomPage.table.helperNotFound")}
        </p>
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
          <Icon icon="solar:home-2-linear" className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">
          {t("RoomPage.table.empty")}
        </p>
        <p className="mt-1 text-sm text-muted">
          {hasFilter
            ? t("RoomPage.table.helperNotFound")
            : t("RoomPage.table.helperEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 p-2 sm:p-4">
        {items.map((room) => {
          const isOccupied = room.isAvailable === false;
          const icon = `akar-icons:circle-${isOccupied ? "check" : "minus"}`;
          const rentStatusKey: TRentStatusKey = room.rentStatus ?? "NONE";
          const rentStyle = RENT_STATUS_STYLE[rentStatusKey];
          const rentStatusLabel = t(`RoomPage.table.rentStatus.${rentStatusKey}`);
          const outstandingCount = room.outstandingRentBills?.length ?? 0;
          // Tagihan paling mendesak (backend mengurutkan dari jatuh tempo paling lama)
          const nextBill = room.outstandingRentBills?.[0];

          return (
            <button
              key={room.id}
              className={`relative w-full min-h-[120px] sm:min-h-[140px] flex flex-col gap-2 items-center justify-between border rounded-xl p-3.5 sm:p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                isOccupied
                  ? "bg-[#e8f1f8] border-[#1b4f8a]/30 hover:border-[#1b4f8a]"
                  : "bg-white border-slate-200 hover:border-[#1b4f8a]"
              }`}
              onClick={() => onDetail(room)}
            >
              {isOccupied ? (
                <span
                  title={rentStatusLabel}
                  aria-label={rentStatusLabel}
                  className={classNames(
                    "absolute right-4 top-4 size-3 rounded-full ring-2 ring-white",
                    rentStyle.dot,
                    rentStatusKey === "OVERDUE" && "animate-pulse",
                  )}
                />
              ) : null}
              {/* Header / Nama Kamar */}
              <div className="w-full text-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                  Kamar
                </span>
                <h2 className="font-bold text-base sm:text-lg tracking-tight text-[#1b4f8a]">
                  {room.name}
                </h2>
              </div>

              <div className="w-full text-center">
                <h3 className="font-bold text-sm sm:text-md tracking-tight text-[#1b4f8a]">
                  {room.type}
                </h3>
              </div>

              {/* Icon Status di Tengah */}
              <div className="my-1">
                <Icon
                  icon={icon}
                  className="text-xl sm:text-2xl text-[#1b4f8a]"
                />
              </div>

              {/* Badge Status */}
              <div
                className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium tracking-wide ${
                  isOccupied
                    ? "bg-[#1b4f8a] text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {isOccupied ? t("common.occuped") : t("common.vacant")}
              </div>

              {/* Status Sewa */}
              {isOccupied ? (
                <div className="flex flex-col items-center gap-0.5 text-[10px] sm:text-xs">
                  <span className={classNames("font-semibold", rentStyle.text)}>
                    {rentStatusLabel}
                  </span>
                  {nextBill && rentStatusKey !== "PAID" ? (
                    <span className="text-slate-500">
                      {outstandingCount > 1
                        ? t("RoomPage.table.rentOutstandingCount", { count: outstandingCount })
                        : t("RoomPage.table.rentDueOn", { date: formatDate(nextBill.dueDate) })}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoomListTableSection;
