"use client";

import { Icon } from "@iconify/react";
import classNames from "classnames";

import { formatDate, getWhatsAppUrl } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TOccupant } from "@/lib/entities";

type TOccupantDetailDialogProps = {
  occupant: TOccupant | null;
  onCancel: () => void;
};

const OccupantDetailDialog = ({ occupant, onCancel }: TOccupantDetailDialogProps) => {
  const { t } = useI18n();

  if (!occupant) {
    return null;
  }

  const whatsappUrl = getWhatsAppUrl(
    occupant.phone,
    t("OccupantPage.detail.whatsappMessage", { name: occupant.fullName }),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="occupant-detail-title"
        className="flex max-h-[min(88vh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-24px_rgba(16,36,61,0.35)]"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="overflow-y-auto px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="occupant-detail-title"
                className="text-xl font-semibold tracking-tight text-ink"
              >
                {occupant.fullName}
              </h2>
              <span
                className={classNames(
                  "mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase",
                  occupant.isActive ? "text-primary" : "text-muted",
                )}
              >
                <span
                  className={classNames(
                    "size-1.5 rounded-full",
                    occupant.isActive ? "bg-primary" : "bg-slate-400",
                  )}
                />
                {occupant.isActive
                  ? t("OccupantPage.filter.active")
                  : t("OccupantPage.filter.inactive")}
              </span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-muted transition hover:bg-slate-50"
              aria-label={t("common.button.cancel")}
            >
              <Icon icon="solar:close-circle-linear" className="size-5" />
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <dt className="text-muted">{t("OccupantPage.table.columns.email")}</dt>
              <dd className="mt-1 font-medium break-all text-ink">{occupant.email}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">{t("OccupantPage.table.columns.phone")}</dt>
              <dd className="mt-1 font-medium text-ink">{occupant.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("OccupantPage.table.columns.property")}</dt>
              <dd className="mt-1 font-medium text-ink">
                {occupant.room?.property?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("OccupantPage.table.columns.room")}</dt>
              <dd className="mt-1 font-medium text-ink">{occupant.room?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("OccupantPage.table.columns.checkIn")}</dt>
              <dd className="mt-1 font-medium text-ink">{formatDate(occupant.checkIn)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("OccupantPage.table.columns.checkOut")}</dt>
              <dd className="mt-1 font-medium text-ink">{formatDate(occupant.checkOut)}</dd>
            </div>
          </dl>
        </div>

        <div className="px-6 pt-4 pb-6">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white transition hover:bg-[#1dae52]"
            >
              <Icon icon="ic:baseline-whatsapp" className="size-5" />
              {t("OccupantPage.detail.whatsapp")}
            </a>
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-muted">
              {t("OccupantPage.detail.whatsappMissing")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OccupantDetailDialog;
