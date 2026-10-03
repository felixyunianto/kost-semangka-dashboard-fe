"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import type { ParsedUrlQueryInput } from "querystring";

import { ConfirmDialog, Loading } from "@/components";
import {
  DEFAULT_PAGINATION,
  GET_EXPENSE_LIST_QUERY_KEY,
  GET_FINANCE_REPORT_QUERY_KEY,
  GET_INCOME_LIST_QUERY_KEY,
  NEW_EXPENSE_ROUTE,
  NEW_INCOME_ROUTE,
} from "@/lib/constants";
import { FINANCE_CATEGORIES } from "@/lib/entities";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { deleteFinanceEntry, getFinanceEntries } from "@/lib/services";
import { toast } from "@/store";

import FinanceEntryListFilterSection from "./FinanceEntryListFilterSection";
import FinanceEntryListTableSection from "./FinanceEntryListTableSection";

import type {
  TFinanceCategory,
  TFinanceEntry,
  TFinanceEntryListPageFilter,
  TFinanceKind,
} from "@/lib/entities";

const FINANCE_INITIAL_FILTER: TFinanceEntryListPageFilter = {
  description: "",
  propertyId: "",
  category: "",
  occurredFrom: "",
  occurredTo: "",
};

const FINANCE_FILTER_KEYS = [
  "description",
  "propertyId",
  "category",
  "occurredFrom",
  "occurredTo",
] as const;

const parseCategory = (value: string | null): TFinanceCategory | "" => {
  return value && FINANCE_CATEGORIES.includes(value as TFinanceCategory)
    ? (value as TFinanceCategory)
    : "";
};

const readFilterFromSearch = (searchParams: URLSearchParams): TFinanceEntryListPageFilter => {
  return {
    description: searchParams.get("description") ?? "",
    propertyId: searchParams.get("propertyId") ?? "",
    category: parseCategory(searchParams.get("category")),
    occurredFrom: searchParams.get("occurredFrom") ?? "",
    occurredTo: searchParams.get("occurredTo") ?? "",
  };
};

const hasFinanceFilterValues = (filter: TFinanceEntryListPageFilter) => {
  return FINANCE_FILTER_KEYS.some((key) => Boolean(filter[key]?.toString().trim()));
};

type TFinanceEntryListPageProps = {
  kind: TFinanceKind;
};

export function FinanceEntryListPage({ kind }: TFinanceEntryListPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <FinanceEntryListPageContent kind={kind} />
    </Suspense>
  );
}

function FinanceEntryListPageContent({ kind }: TFinanceEntryListPageProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [entryToDelete, setEntryToDelete] = useState<TFinanceEntry | null>(null);

  const pageQuery = searchParams.get("page");
  const appliedFilter = readFilterFromSearch(searchParams);
  const paramQuery = {
    page: pageQuery ? Number.parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...appliedFilter,
  };

  const [filter, setFilter] = useState<TFinanceEntryListPageFilter>(appliedFilter);
  const [dateError, setDateError] = useState("");
  const copyKey = kind === "income" ? "FinancePage.income" : "FinancePage.expense";
  const listQueryKey = kind === "income" ? GET_INCOME_LIST_QUERY_KEY : GET_EXPENSE_LIST_QUERY_KEY;
  const addHref = kind === "income" ? NEW_INCOME_ROUTE : NEW_EXPENSE_ROUTE;

  const constructQueryParam = (opt?: { page?: number }) => {
    return {
      page: opt?.page || DEFAULT_PAGINATION.page,
      description: filter.description?.trim() || null,
      propertyId: filter.propertyId?.trim() || null,
      category: filter.category || null,
      occurredFrom: filter.occurredFrom?.trim() || null,
      occurredTo: filter.occurredTo?.trim() || null,
    };
  };

  const handleChangeQueryParam = (query?: string | ParsedUrlQueryInput | null) => {
    const url =
      typeof query === "string"
        ? query
        : buildPathnameWithQueryPath(pathname, searchParams, query);

    window.history.pushState(null, "", url);
  };

  const handleResetFilter = () => {
    setFilter(FINANCE_INITIAL_FILTER);
    setDateError("");
    handleChangeQueryParam();
  };

  const handleSearch = () => {
    if (filter.occurredFrom && filter.occurredTo && filter.occurredFrom > filter.occurredTo) {
      setDateError(t("FinancePage.form.invalidDateRange"));
      return;
    }

    setDateError("");
    handleChangeQueryParam(constructQueryParam());
  };

  const handleRetry = () => {
    handleChangeQueryParam(constructQueryParam());
  };

  const handleChangePage = (newPage: number) => {
    handleChangeQueryParam(constructQueryParam({ page: newPage }));
  };

  const entriesQuery = useQuery({
    queryKey: [...listQueryKey, paramQuery],
    queryFn: () =>
      getFinanceEntries(kind, {
        ...appliedFilter,
        page:
          Number.isFinite(paramQuery.page) && paramQuery.page > 0
            ? paramQuery.page
            : DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
      }),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entry: TFinanceEntry) => deleteFinanceEntry(kind, entry.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKey });
      void queryClient.invalidateQueries({ queryKey: GET_FINANCE_REPORT_QUERY_KEY });
      setEntryToDelete(null);
      toast.success(t("common.toast.deleted"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t(`${copyKey}.title`)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t(`${copyKey}.subtitle`)}
          </p>
        </div>
        <Link
          href={addHref}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Icon icon="solar:add-circle-linear" className="size-5" />
          {t(`${copyKey}.add`)}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <FinanceEntryListFilterSection
          filter={filter}
          onFilterChange={(next) => {
            setDateError("");
            setFilter(next);
          }}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasFinanceFilterValues(filter) || hasFinanceFilterValues(appliedFilter)}
          isSearching={entriesQuery.isFetching}
          error={dateError}
        />
        <FinanceEntryListTableSection
          kind={kind}
          items={entriesQuery.data?.items ?? []}
          pagination={entriesQuery.data?.pagination ?? DEFAULT_PAGINATION}
          isLoading={entriesQuery.isLoading}
          isError={entriesQuery.isError}
          hasFilter={hasFinanceFilterValues(appliedFilter)}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
          onDelete={setEntryToDelete}
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(entryToDelete)}
        title={t(`${copyKey}.deleteTitle`)}
        description={t(`${copyKey}.deleteDescription`, {
          description: entryToDelete?.description ?? "",
        })}
        confirmLabel={t("common.button.delete")}
        icon="solar:trash-bin-trash-linear"
        tone="danger"
        isProcessing={deleteEntryMutation.isPending}
        error={deleteEntryMutation.error?.message}
        onCancel={() => {
          if (deleteEntryMutation.isPending) return;
          setEntryToDelete(null);
          deleteEntryMutation.reset();
        }}
        onConfirm={() => {
          if (!entryToDelete) return;
          deleteEntryMutation.mutate(entryToDelete);
        }}
      />
    </section>
  );
}
