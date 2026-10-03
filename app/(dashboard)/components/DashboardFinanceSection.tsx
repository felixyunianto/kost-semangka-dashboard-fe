"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { Loading } from "@/components";
import { GET_FINANCE_REPORT_QUERY_KEY, REPORTS_ROUTE } from "@/lib/constants";
import { formatCurrency } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFinanceReport } from "@/lib/services";

import { DashboardFinanceChart } from "./DashboardFinanceChart";
import {
  DASHBOARD_FINANCE_PERIODS,
  getDashboardFinanceRange,
  type TDashboardFinancePeriod,
} from "./dashboard-finance";

type TDashboardFinanceSectionProps = {
  propertyId?: string;
  period: TDashboardFinancePeriod;
  onPeriodChange: (period: TDashboardFinancePeriod) => void;
};

const PERIOD_LABEL_KEY = {
  "1m": "DashboardPage.finance.period1m",
  "3m": "DashboardPage.finance.period3m",
  "6m": "DashboardPage.finance.period6m",
  "1y": "DashboardPage.finance.period1y",
} as const;

export function DashboardFinanceSection({
  propertyId,
  period,
  onPeriodChange,
}: TDashboardFinanceSectionProps) {
  const { t } = useI18n();
  const range = getDashboardFinanceRange(period);

  const reportQuery = useQuery({
    queryKey: [...GET_FINANCE_REPORT_QUERY_KEY, "dashboard", propertyId, range],
    queryFn: () =>
      getFinanceReport({
        ...(propertyId ? { propertyId } : {}),
        from: range.from,
        to: range.to,
      }),
  });

  const report = reportQuery.data;
  const reportHref = `${REPORTS_ROUTE}?from=${range.from}&to=${range.to}${
    propertyId ? `&propertyId=${propertyId}` : ""
  }`;

  return (
    <div className="mt-8 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">
            {t("DashboardPage.finance.title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("DashboardPage.finance.subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {DASHBOARD_FINANCE_PERIODS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPeriodChange(item)}
                className={classNames(
                  "h-9 rounded-lg px-3 text-sm font-medium transition",
                  period === item
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink",
                )}
              >
                {t(PERIOD_LABEL_KEY[item])}
              </button>
            ))}
          </div>
          <Link
            href={reportHref}
            className="inline-flex h-9 items-center justify-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            {t("DashboardPage.finance.viewReport")}
            <Icon icon="solar:arrow-right-linear" className="size-4" />
          </Link>
        </div>
      </div>

      {reportQuery.isLoading ? (
        <div className="py-10">
          <Loading />
        </div>
      ) : null}

      {reportQuery.isError ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">{t("DashboardPage.finance.empty")}</p>
          <button
            type="button"
            onClick={() => {
              void reportQuery.refetch();
            }}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t("DashboardPage.retry")}
          </button>
        </div>
      ) : null}

      {report ? (
        <div className="mt-6 flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <FinanceStatCard
              icon="solar:wad-of-money-linear"
              label={t("DashboardPage.finance.gross")}
              value={formatCurrency(report.income.total)}
              helper={`${t("DashboardPage.finance.rental", {
                amount: formatCurrency(report.income.rental.amount),
              })} · ${t("DashboardPage.finance.other", {
                amount: formatCurrency(report.income.other.amount),
              })}`}
            />
            <FinanceStatCard
              icon="solar:bill-list-linear"
              label={t("DashboardPage.finance.expense")}
              value={formatCurrency(report.expense.amount)}
            />
            <FinanceStatCard
              icon="solar:chart-2-linear"
              label={t("DashboardPage.finance.net")}
              value={formatCurrency(report.net)}
              tone={Number(report.net) < 0 ? "danger" : "success"}
            />
          </div>
          <DashboardFinanceChart items={report.monthly} />
        </div>
      ) : null}
    </div>
  );
}

function FinanceStatCard({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  helper?: string;
  tone?: "danger" | "success";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4">
      <div className="flex items-center gap-3">
        <div
          className={classNames(
            "flex size-10 items-center justify-center rounded-2xl",
            tone === "danger"
              ? "bg-red-50 text-red-600"
              : tone === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-primary-soft text-primary",
          )}
        >
          <Icon icon={icon} className="size-5" />
        </div>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p
        className={classNames(
          "mt-3 text-2xl font-semibold tracking-tight",
          tone === "danger" ? "text-red-600" : "text-ink",
        )}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-xs leading-relaxed text-muted">{helper}</p> : null}
    </div>
  );
}
