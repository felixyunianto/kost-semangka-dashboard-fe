"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import classNames from "classnames";
import type { ParsedUrlQueryInput } from "querystring";

import { Loading, Select, TextInput } from "@/components";
import {
  BILLS_ROUTE,
  EXPENSES_ROUTE,
  GET_FINANCE_REPORT_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  INCOMES_ROUTE,
} from "@/lib/constants";
import { buildPathnameWithQueryPath, formatCurrency, formatMonth } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFinanceReport, getProperties } from "@/lib/services";

import type { TFinanceCategoryBreakdown, TFinanceReportFilter } from "@/lib/entities";

const currentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${day}`,
  };
};

const REPORT_DEFAULT_FILTER = (): TFinanceReportFilter => {
  const range = currentMonthRange();

  return {
    propertyId: "",
    from: range.from,
    to: range.to,
  };
};

const readReportFilter = (searchParams: URLSearchParams): TFinanceReportFilter => {
  const defaults = REPORT_DEFAULT_FILTER();

  return {
    propertyId: searchParams.get("propertyId") ?? "",
    from: searchParams.get("from") ?? defaults.from,
    to: searchParams.get("to") ?? defaults.to,
  };
};

const hasCustomReportFilter = (filter: TFinanceReportFilter) => {
  const defaults = REPORT_DEFAULT_FILTER();

  return (
    Boolean(filter.propertyId?.trim()) ||
    filter.from !== defaults.from ||
    filter.to !== defaults.to
  );
};

export default function ReportsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportsPageContent />
    </Suspense>
  );
}

function ReportsPageContent() {
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const appliedFilter = readReportFilter(searchParams);
  const [filter, setFilter] = useState<TFinanceReportFilter>(appliedFilter);
  const [dateError, setDateError] = useState("");

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });

  const reportQuery = useQuery({
    queryKey: [...GET_FINANCE_REPORT_QUERY_KEY, appliedFilter],
    queryFn: () =>
      getFinanceReport({
        ...(appliedFilter.propertyId?.trim() && {
          propertyId: appliedFilter.propertyId.trim(),
        }),
        from: appliedFilter.from,
        to: appliedFilter.to,
      }),
  });

  const properties = propertiesQuery.data?.items ?? [];
  const report = reportQuery.data;

  const handleChangeQueryParam = (query?: ParsedUrlQueryInput | null) => {
    const url = buildPathnameWithQueryPath(pathname, searchParams, query);
    window.history.pushState(null, "", url);
  };

  const handleSearch = () => {
    if (filter.from && filter.to && filter.from > filter.to) {
      setDateError(t("ReportPage.filter.invalidDateRange"));
      return;
    }

    setDateError("");
    handleChangeQueryParam({
      propertyId: filter.propertyId?.trim() || null,
      from: filter.from?.trim() || null,
      to: filter.to?.trim() || null,
    });
  };

  const handleReset = () => {
    const next = REPORT_DEFAULT_FILTER();
    setFilter(next);
    setDateError("");
    handleChangeQueryParam();
  };

  const periodQuery = `occurredFrom=${appliedFilter.from}&occurredTo=${appliedFilter.to}${
    appliedFilter.propertyId ? `&propertyId=${appliedFilter.propertyId}` : ""
  }`;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("ReportPage.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("ReportPage.subtitle")}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-5">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Select
              id="report-property-filter"
              label={t("ReportPage.filter.property")}
              value={filter.propertyId ?? ""}
              onChange={(event) => {
                setFilter((current) => ({
                  ...current,
                  propertyId: event.target.value,
                }));
              }}
            >
              <option value="">{t("ReportPage.filter.propertyAll")}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>
            <TextInput
              id="report-from-filter"
              type="date"
              label={t("ReportPage.filter.from")}
              value={filter.from ?? ""}
              onChange={(event) => {
                setDateError("");
                setFilter((current) => ({
                  ...current,
                  from: event.target.value,
                }));
              }}
            />
            <TextInput
              id="report-to-filter"
              type="date"
              label={t("ReportPage.filter.to")}
              value={filter.to ?? ""}
              onChange={(event) => {
                setDateError("");
                setFilter((current) => ({
                  ...current,
                  to: event.target.value,
                }));
              }}
            />
          </div>
          {dateError ? <p className="text-sm text-red-700">{dateError}</p> : null}
          <div className="flex shrink-0 gap-2">
            <button
              type="submit"
              disabled={reportQuery.isFetching}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
            >
              <Icon icon="solar:magnifer-linear" className="size-5" />
              {t("common.search")}
            </button>
            <button
              type="button"
              disabled={
                !(hasCustomReportFilter(filter) || hasCustomReportFilter(appliedFilter)) ||
                reportQuery.isFetching
              }
              onClick={handleReset}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              <Icon icon="solar:restart-linear" className="size-5" />
              {t("common.button.reset")}
            </button>
          </div>
        </form>
      </div>

      {reportQuery.isLoading ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <Loading />
        </div>
      ) : null}

      {reportQuery.isError ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <p className="text-sm font-medium text-ink">{t("ReportPage.empty")}</p>
          <button
            type="button"
            onClick={() => {
              void reportQuery.refetch();
            }}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t("common.button.retry")}
          </button>
        </div>
      ) : null}

      {report ? (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <ReportCard
              href={`${BILLS_ROUTE}?status=PAID${appliedFilter.propertyId ? `&propertyId=${appliedFilter.propertyId}` : ""}`}
              icon="solar:home-2-linear"
              label={t("ReportPage.cards.rentalIncome")}
              value={formatCurrency(report.income.rental.amount)}
              helper={t("ReportPage.cards.entries", {
                count: report.income.rental.count,
              })}
            />
            <ReportCard
              href={`${INCOMES_ROUTE}?${periodQuery}`}
              icon="solar:wad-of-money-linear"
              label={t("ReportPage.cards.otherIncome")}
              value={formatCurrency(report.income.other.amount)}
              helper={t("ReportPage.cards.entries", {
                count: report.income.other.count,
              })}
            />
            <ReportCard
              icon="solar:safe-square-linear"
              label={t("ReportPage.cards.totalIncome")}
              value={formatCurrency(report.income.total)}
            />
            <ReportCard
              href={`${EXPENSES_ROUTE}?${periodQuery}`}
              icon="solar:bill-list-linear"
              label={t("ReportPage.cards.expenses")}
              value={formatCurrency(report.expense.amount)}
              helper={t("ReportPage.cards.entries", {
                count: report.expense.count,
              })}
            />
            <ReportCard
              icon="solar:chart-2-linear"
              label={t("ReportPage.cards.net")}
              value={formatCurrency(report.net)}
              tone={Number(report.net) < 0 ? "danger" : "success"}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CategoryBreakdownCard
              title={t("ReportPage.breakdown.otherIncome")}
              items={report.income.other.byCategory}
            />
            <CategoryBreakdownCard
              title={t("ReportPage.breakdown.expenses")}
              items={report.expense.byCategory}
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-5">
            <h2 className="text-base font-semibold tracking-tight text-ink">
              {t("ReportPage.monthly.title")}
            </h2>
            {report.monthly.length === 0 ? (
              <p className="mt-4 text-sm text-muted">{t("ReportPage.monthly.empty")}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-muted">
                      <th className="py-2 pr-4 font-medium">{t("ReportPage.monthly.month")}</th>
                      <th className="py-2 pr-4 font-medium">{t("ReportPage.monthly.income")}</th>
                      <th className="py-2 pr-4 font-medium">{t("ReportPage.monthly.expense")}</th>
                      <th className="py-2 font-medium">{t("ReportPage.monthly.net")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthly.map((row) => (
                      <tr key={row.month} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-ink">{formatMonth(row.month)}</td>
                        <td className="py-3 pr-4 text-ink">{formatCurrency(row.income)}</td>
                        <td className="py-3 pr-4 text-ink">{formatCurrency(row.expense)}</td>
                        <td
                          className={classNames(
                            "py-3 font-semibold",
                            Number(row.net) < 0 ? "text-red-600" : "text-ink",
                          )}
                        >
                          {formatCurrency(row.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ReportCard({
  href,
  icon,
  label,
  value,
  helper,
  tone,
}: {
  href?: string;
  icon: string;
  label: string;
  value: string;
  helper?: string;
  tone?: "danger" | "success";
}) {
  const content = (
    <>
      <div
        className={classNames(
          "flex size-11 items-center justify-center rounded-2xl",
          tone === "danger"
            ? "bg-red-50 text-red-600"
            : tone === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-primary-soft text-primary",
        )}
      >
        <Icon icon={icon} className="size-5" />
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p
        className={classNames(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "danger" ? "text-red-600" : "text-ink",
        )}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-sm text-muted">{helper}</p> : null}
    </>
  );

  if (!href) {
    return (
      <div className="rounded-xl border border-white bg-white p-5 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-xl border border-white bg-white p-5 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] transition hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_rgba(27,79,138,0.22)]"
    >
      {content}
    </Link>
  );
}

function CategoryBreakdownCard({
  title,
  items,
}: {
  title: string;
  items: TFinanceCategoryBreakdown[];
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-5">
      <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t("ReportPage.breakdown.empty")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-muted">
                <th className="py-2 pr-4 font-medium">{t("ReportPage.breakdown.category")}</th>
                <th className="py-2 pr-4 font-medium">{t("ReportPage.breakdown.count")}</th>
                <th className="py-2 font-medium">{t("ReportPage.breakdown.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.category} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">
                    {t(`FinancePage.category.${item.category}`)}
                  </td>
                  <td className="py-3 pr-4 text-muted">{item.count}</td>
                  <td className="py-3 font-medium text-ink">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
