import type { TPaginationParam } from "./pagination";

export type TFinanceKind = "income" | "expense";
export type TFinanceType = "INCOME" | "EXPENSE";
export type TFinanceCategory = "MAINTENANCE" | "SALARY" | "OTHER";

export const FINANCE_CATEGORIES: TFinanceCategory[] = [
  "MAINTENANCE",
  "SALARY",
  "OTHER",
];

export type TFinanceProperty = {
  id: string;
  name: string;
};

export type TFinanceEntry = {
  id: string;
  propertyId: string;
  type: TFinanceType;
  category: TFinanceCategory;
  amount: string | number;
  occurredAt: string;
  description: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  property?: TFinanceProperty | null;
};

export type TFinanceEntryListPageFilter = {
  description?: string;
  propertyId?: string;
  category?: TFinanceCategory | "";
  occurredFrom?: string;
  occurredTo?: string;
};

export type TFinanceEntryParamList = TPaginationParam & TFinanceEntryListPageFilter;

export type TCreateFinanceEntryPayload = {
  propertyId: string;
  category: TFinanceCategory;
  amount: number;
  occurredAt: string;
  description: string;
  notes?: string;
};

export type TUpdateFinanceEntryPayload = {
  category?: TFinanceCategory;
  amount?: number;
  occurredAt?: string;
  description?: string;
  notes?: string;
};

export type TFinanceEntryFormSubmit = {
  propertyId: string;
  payload: TCreateFinanceEntryPayload | TUpdateFinanceEntryPayload;
};

export type TFinanceAmountGroup = {
  count: number;
  amount: string | number;
};

export type TFinanceCategoryBreakdown = {
  category: TFinanceCategory;
  count: number;
  amount: string | number;
};

export type TFinanceReportMonthly = {
  month: string;
  income: string | number;
  expense: string | number;
  net: string | number;
};

export type TFinanceReport = {
  period: {
    from: string;
    to: string;
  };
  propertyId?: string | null;
  income: {
    rental: TFinanceAmountGroup;
    other: TFinanceAmountGroup & {
      byCategory: TFinanceCategoryBreakdown[];
    };
    total: string | number;
  };
  expense: TFinanceAmountGroup & {
    byCategory: TFinanceCategoryBreakdown[];
  };
  net: string | number;
  monthly: TFinanceReportMonthly[];
};

export type TFinanceReportFilter = {
  propertyId?: string;
  from?: string;
  to?: string;
};

export const financeKindPath = (kind: TFinanceKind) => {
  return kind === "income" ? "incomes" : "expenses";
};
