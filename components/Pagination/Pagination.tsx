"use client";

import { Icon } from "@iconify/react";

import { useI18n } from "@/lib/i18n/useI18n";

import type { TPagination } from "@/lib/entities";

type TPaginationBarProps = {
  pagination: TPagination;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationBar({
  pagination,
  onPageChange,
  disabled,
}: TPaginationBarProps) {
  const { t } = useI18n();
  const { page, limit, total, totalPages } = pagination;

  if (total === 0) {
    return null;
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        {t("common.pagination.showing", { from, to, total })}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
            {t("common.pagination.previous")}
          </button>
          <button
            type="button"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("common.pagination.next")}
            <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
