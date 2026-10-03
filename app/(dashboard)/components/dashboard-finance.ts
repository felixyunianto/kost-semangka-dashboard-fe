export type TDashboardFinancePeriod = "1m" | "3m" | "6m" | "1y";

const PERIOD_MONTHS: Record<TDashboardFinancePeriod, number> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

export const DASHBOARD_FINANCE_PERIODS: TDashboardFinancePeriod[] = [
  "1m",
  "3m",
  "6m",
  "1y",
];

export const getDashboardFinanceRange = (period: TDashboardFinancePeriod) => {
  const months = PERIOD_MONTHS[period];
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  return {
    from: toLocalDate(from),
    to: toLocalDate(now),
  };
};

const toLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
