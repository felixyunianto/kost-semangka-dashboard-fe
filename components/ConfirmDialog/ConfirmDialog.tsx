"use client";

import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { useI18n } from "@/lib/i18n/useI18n";

type TConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  icon?: string;
  tone?: "primary" | "warning" | "danger";
  isProcessing?: boolean;
  error?: string;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

const toneClassName = {
  primary: {
    iconWrap: "bg-primary-soft text-primary",
    confirm: "bg-primary text-white hover:bg-primary-hover",
  },
  warning: {
    iconWrap: "bg-amber-50 text-amber-700",
    confirm: "bg-primary text-white hover:bg-primary-hover",
  },
  danger: {
    iconWrap: "bg-red-50 text-red-600",
    confirm: "bg-red-600 text-white hover:bg-red-700",
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  icon = "solar:danger-triangle-linear",
  tone = "primary",
  isProcessing,
  error,
  children,
  onCancel,
  onConfirm,
}: TConfirmDialogProps) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  const toneClasses = toneClassName[tone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.28)]"
      >
        <div
          className={classNames(
            "flex size-11 items-center justify-center rounded-2xl",
            toneClasses.iconWrap,
          )}
        >
          <Icon icon={icon} className="size-6" />
        </div>
        <h2
          id="confirm-dialog-title"
          className="mt-4 text-lg font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        {children}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("common.button.cancel")}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={classNames(
              "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
              toneClasses.confirm,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
