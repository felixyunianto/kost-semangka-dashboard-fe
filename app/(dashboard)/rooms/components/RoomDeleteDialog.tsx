"use client";

import { Icon } from "@iconify/react";

import { useI18n } from "@/lib/i18n/useI18n";

import type { TRoom } from "@/lib/entities";

type TRoomDeleteDialogProps = {
  room: TRoom | null;
  isDeleting?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const RoomDeleteDialog = ({
  room,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: TRoomDeleteDialogProps) => {
  const { t } = useI18n();

  if (!room) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-delete-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.28)]"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Icon icon="solar:trash-bin-trash-linear" className="size-6" />
        </div>
        <h2
          id="room-delete-title"
          className="mt-4 text-lg font-semibold tracking-tight text-ink"
        >
          {t("RoomPage.table.deleteTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("RoomPage.table.deleteDescription", { name: room.name })}
        </p>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("common.button.cancel")}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("RoomPage.table.deleteConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDeleteDialog;
