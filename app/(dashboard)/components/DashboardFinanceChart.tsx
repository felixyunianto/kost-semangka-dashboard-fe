"use client";

import { useMemo, useState } from "react";

import { formatCompactCurrency, formatCurrency, formatMonth } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TFinanceReportMonthly } from "@/lib/entities";

type TDashboardFinanceChartProps = {
  items: TFinanceReportMonthly[];
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const PAD = { top: 16, right: 12, bottom: 36, left: 56 };

const toAmount = (value: string | number) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export function DashboardFinanceChart({ items }: TDashboardFinanceChartProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    return items.map((item) => ({
      month: item.month,
      label: formatMonth(item.month),
      income: toAmount(item.income),
      expense: toAmount(item.expense),
      net: toAmount(item.net),
    }));
  }, [items]);

  const { minY, maxY } = useMemo(() => {
    const values = series.flatMap((item) => [item.income, item.expense, item.net]);
    const nextMin = Math.min(0, ...values);
    const nextMax = Math.max(0, ...values);

    return {
      minY: nextMin,
      maxY: nextMax === nextMin ? nextMin + 1 : nextMax,
    };
  }, [series]);

  const innerWidth = CHART_WIDTH - PAD.left - PAD.right;
  const innerHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const groupWidth = series.length ? innerWidth / series.length : innerWidth;
  const barGap = 3;
  const barWidth = Math.min(16, Math.max(6, (groupWidth - barGap * 2) / 3.6));

  const getGroupLayout = (index: number) => {
    const slotX = PAD.left + groupWidth * index;
    const clusterWidth = barWidth * 3 + barGap * 2;
    const clusterStart = slotX + (groupWidth - clusterWidth) / 2;

    const incomeX = clusterStart;
    const expenseX = clusterStart + barWidth + barGap;
    const netX = clusterStart + (barWidth + barGap) * 2;

    return {
      slotX,
      incomeX,
      expenseX,
      netX,
      incomeCenter: incomeX + barWidth / 2,
      expenseCenter: expenseX + barWidth / 2,
      netCenter: netX + barWidth / 2,
      labelX: slotX + groupWidth / 2,
    };
  };

  const linePoints = (
    getX: (layout: ReturnType<typeof getGroupLayout>) => number,
    getY: (item: (typeof series)[number]) => number,
  ) => {
    return series
      .map((item, index) => `${getX(getGroupLayout(index))},${getY(item)}`)
      .join(" ");
  };

  const yFor = (value: number) => {
    return PAD.top + ((maxY - value) / (maxY - minY)) * innerHeight;
  };

  const zeroY = yFor(0);
  const ticks = [maxY, (maxY + minY) / 2, minY];
  const active = activeIndex === null ? null : series[activeIndex];

  if (series.length === 0) {
    return <p className="text-sm text-muted">{t("DashboardPage.finance.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary" />
          <span className="h-0.5 w-3 rounded-full bg-primary" />
          {t("DashboardPage.finance.gross")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-500" />
          <span className="h-0.5 w-3 rounded-full bg-amber-500" />
          {t("DashboardPage.finance.expense")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500" />
          <span className="h-0.5 w-3 rounded-full bg-emerald-600" />
          {t("DashboardPage.finance.net")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-64 min-w-[520px] w-full"
          role="img"
          aria-label={t("DashboardPage.finance.title")}
        >
          {ticks.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={PAD.left}
                  x2={CHART_WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  className="stroke-slate-100"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px]"
                >
                  {formatCompactCurrency(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={PAD.left}
            x2={CHART_WIDTH - PAD.right}
            y1={zeroY}
            y2={zeroY}
            className="stroke-slate-200"
          />

          {series.map((item, index) => {
            const layout = getGroupLayout(index);
            const incomeHeight = Math.max(1, Math.abs(yFor(item.income) - zeroY));
            const expenseHeight = Math.max(1, Math.abs(yFor(item.expense) - zeroY));
            const netHeight = Math.max(1, Math.abs(yFor(item.net) - zeroY));

            return (
              <g
                key={item.month}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <rect
                  x={layout.slotX}
                  y={PAD.top}
                  width={groupWidth}
                  height={innerHeight}
                  className="fill-transparent"
                />
                <rect
                  x={layout.incomeX}
                  y={Math.min(yFor(item.income), zeroY)}
                  width={barWidth}
                  height={incomeHeight}
                  rx={3}
                  className={activeIndex === index ? "fill-primary" : "fill-primary/80"}
                />
                <rect
                  x={layout.expenseX}
                  y={Math.min(yFor(item.expense), zeroY)}
                  width={barWidth}
                  height={expenseHeight}
                  rx={3}
                  className={activeIndex === index ? "fill-amber-500" : "fill-amber-400"}
                />
                <rect
                  x={layout.netX}
                  y={Math.min(yFor(item.net), zeroY)}
                  width={barWidth}
                  height={netHeight}
                  rx={3}
                  className={activeIndex === index ? "fill-emerald-600" : "fill-emerald-500"}
                />
                <text
                  x={layout.labelX}
                  y={CHART_HEIGHT - 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {series.length > 1 ? (
            <>
              <polyline
                fill="none"
                strokeWidth="2"
                className="stroke-primary"
                points={linePoints((layout) => layout.incomeCenter, (item) => yFor(item.income))}
              />
              <polyline
                fill="none"
                strokeWidth="2"
                className="stroke-amber-500"
                points={linePoints((layout) => layout.expenseCenter, (item) => yFor(item.expense))}
              />
              <polyline
                fill="none"
                strokeWidth="2"
                className="stroke-emerald-700"
                points={linePoints((layout) => layout.netCenter, (item) => yFor(item.net))}
              />
            </>
          ) : null}

          {series.map((item, index) => {
            const layout = getGroupLayout(index);
            const radius = activeIndex === index ? 4.5 : 3.5;

            return (
              <g key={`${item.month}-points`}>
                <circle
                  cx={layout.incomeCenter}
                  cy={yFor(item.income)}
                  r={radius}
                  className="fill-white stroke-primary"
                  strokeWidth="2"
                />
                <circle
                  cx={layout.expenseCenter}
                  cy={yFor(item.expense)}
                  r={radius}
                  className="fill-white stroke-amber-500"
                  strokeWidth="2"
                />
                <circle
                  cx={layout.netCenter}
                  cy={yFor(item.net)}
                  r={radius}
                  className="fill-white stroke-emerald-700"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {active ? (
        <div className="grid gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted sm:grid-cols-4">
          <p className="font-semibold text-ink">{active.label}</p>
          <p>
            {t("DashboardPage.finance.gross")}:{" "}
            <span className="font-medium text-ink">{formatCurrency(active.income)}</span>
          </p>
          <p>
            {t("DashboardPage.finance.expense")}:{" "}
            <span className="font-medium text-ink">{formatCurrency(active.expense)}</span>
          </p>
          <p>
            {t("DashboardPage.finance.net")}:{" "}
            <span className={`font-medium ${active.net < 0 ? "text-red-600" : "text-ink"}`}>
              {formatCurrency(active.net)}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">{t("DashboardPage.finance.subtitle")}</p>
      )}
    </div>
  );
}
