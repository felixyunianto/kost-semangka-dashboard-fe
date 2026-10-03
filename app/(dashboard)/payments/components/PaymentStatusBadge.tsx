"use client";

import classNames from "classnames";

import { useI18n } from "@/lib/i18n/useI18n";

import type { TPaymentChargeStatus, TPaymentStatus } from "@/lib/entities";

const statusClassName = (status: string) => {
  if (status === "PAID") {
    return "bg-primary-soft text-primary";
  }

  if (status === "FAILED" || status === "EXPIRED" || status === "CANCELLED") {
    return "bg-red-50 text-red-600";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-muted";
};

export function PaymentStatusBadge({
  status,
  kind = "payment",
}: {
  status: TPaymentStatus | TPaymentChargeStatus | string;
  kind?: "payment" | "charge";
}) {
  const { t } = useI18n();
  const labelKey =
    kind === "charge" ? `PaymentPage.chargeStatus.${status}` : `PaymentPage.status.${status}`;
  const label = t(labelKey);

  return (
    <span
      className={classNames(
        "inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium",
        statusClassName(status),
      )}
    >
      {label === labelKey ? status : label}
    </span>
  );
}
