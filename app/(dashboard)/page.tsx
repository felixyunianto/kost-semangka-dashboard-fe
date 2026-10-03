"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Loading, Select } from "@/components";
import {
  BILLS_ROUTE,
  GET_DASHBOARD_SUMMARY_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  OCCUPANTS_ROUTE,
  PROPERTIES_ROUTE,
  ROOMS_ROUTE,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getDashboardSummary, getProperties } from "@/lib/services";
import { useAuth } from "@/store";

import { DashboardFinanceSection } from "./components/DashboardFinanceSection";

import type { TDashboardBillStat } from "@/lib/entities";
import type { TDashboardFinancePeriod } from "./components/dashboard-finance";

const formatBillStat = (stat?: TDashboardBillStat) => {
  return {
    count: stat?.count ?? 0,
    amount: formatCurrency(stat?.payableAmount ?? 0),
  };
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState("");
  const [financePeriod, setFinancePeriod] =
    useState<TDashboardFinancePeriod>("6m");

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });

  const summaryQuery = useQuery({
    queryKey: [...GET_DASHBOARD_SUMMARY_QUERY_KEY, propertyId],
    queryFn: () => getDashboardSummary(propertyId || undefined),
  });

  const properties = propertiesQuery.data?.items ?? [];
  const summary = summaryQuery.data;
  const unpaid = formatBillStat(summary?.bills.unpaid);
  const overdue = formatBillStat(summary?.bills.overdue);
  const pending = formatBillStat(summary?.bills.pending);
  const paidThisMonth = formatBillStat(summary?.bills.paidThisMonth);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("common.overview")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t("DashboardPage.title", { name: user?.fullName || "there" })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("DashboardPage.subtitle")}
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <Select
            id="dashboard-property-filter"
            label={t("DashboardPage.filter.property")}
            value={propertyId}
            onChange={(event) => {
              setPropertyId(event.target.value);
            }}
          >
            <option value="">{t("DashboardPage.filter.propertyAll")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {summaryQuery.isLoading ? (
        <div className="mt-8 rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <Loading />
        </div>
      ) : null}

      {summaryQuery.isError ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <p className="text-sm font-medium text-ink">
            {t("DashboardPage.subtitle")}
          </p>
          <button
            type="button"
            onClick={() => {
              void summaryQuery.refetch();
            }}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t("DashboardPage.retry")}
          </button>
        </div>
      ) : null}

      <DashboardFinanceSection
        propertyId={propertyId || undefined}
        period={financePeriod}
        onPeriodChange={setFinancePeriod}
      />

      {summary ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            href={PROPERTIES_ROUTE}
            icon="solar:buildings-2-linear"
            label={t("DashboardPage.cards.properties")}
            value={String(summary.properties.total)}
          />
          <SummaryCard
            href={propertyId ? `${ROOMS_ROUTE}/${propertyId}` : ROOMS_ROUTE}
            icon="solar:home-2-linear"
            label={t("DashboardPage.cards.rooms")}
            value={String(summary.rooms.total)}
            helper={`${summary.rooms.occupied} ${t("DashboardPage.cards.occupied")} · ${summary.rooms.available} ${t("DashboardPage.cards.available")}`}
          />
          <SummaryCard
            href={propertyId ? `${ROOMS_ROUTE}/${propertyId}` : ROOMS_ROUTE}
            icon="solar:pie-chart-2-linear"
            label={t("DashboardPage.cards.occupancy")}
            value={`${summary.rooms.occupancyRate}%`}
            progress={summary.rooms.occupancyRate}
          />
          <SummaryCard
            href={
              propertyId
                ? `${OCCUPANTS_ROUTE}?propertyId=${propertyId}`
                : OCCUPANTS_ROUTE
            }
            icon="solar:users-group-rounded-linear"
            label={t("DashboardPage.cards.occupants")}
            value={String(summary.occupants.active)}
          />
          <SummaryCard
            href={`${BILLS_ROUTE}?status=UNPAID${propertyId ? `&propertyId=${propertyId}` : ""}`}
            icon="solar:document-text-linear"
            label={t("DashboardPage.cards.unpaid")}
            value={String(unpaid.count)}
            helper={unpaid.amount}
          />
          <SummaryCard
            href={`${BILLS_ROUTE}?status=OVERDUE${propertyId ? `&propertyId=${propertyId}` : ""}`}
            icon="solar:danger-triangle-linear"
            label={t("DashboardPage.cards.overdue")}
            value={String(overdue.count)}
            helper={overdue.amount}
            tone="danger"
          />
          <SummaryCard
            href={`${BILLS_ROUTE}?status=PENDING${propertyId ? `&propertyId=${propertyId}` : ""}`}
            icon="solar:hourglass-line-linear"
            label={t("DashboardPage.cards.pending")}
            value={String(pending.count)}
            helper={pending.amount}
          />
          <SummaryCard
            href={`${BILLS_ROUTE}?status=PAID${propertyId ? `&propertyId=${propertyId}` : ""}`}
            icon="solar:check-circle-linear"
            label={t("DashboardPage.cards.paidThisMonth")}
            value={String(paidThisMonth.count)}
            helper={paidThisMonth.amount}
          />
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({
  href,
  icon,
  label,
  value,
  helper,
  progress,
  tone,
}: {
  href: string;
  icon: string;
  label: string;
  value: string;
  helper?: string;
  progress?: number;
  tone?: "danger";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white bg-white p-5 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] transition hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_rgba(27,79,138,0.22)]"
    >
      <div
        className={`flex size-11 items-center justify-center rounded-2xl ${
          tone === "danger"
            ? "bg-red-50 text-red-600"
            : "bg-primary-soft text-primary"
        }`}
      >
        <Icon icon={icon} className="size-5" />
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {helper ? <p className="mt-1 text-sm text-muted">{helper}</p> : null}
      {progress === undefined ? null : (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Link>
  );
}
