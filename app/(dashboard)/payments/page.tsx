"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ParsedUrlQueryInput } from "querystring";

import { Loading } from "@/components/Loading";
import { DEFAULT_PAGINATION, GET_PAYMENT_LIST_QUERY_KEY } from "@/lib/constants";
import { PAYMENT_GATEWAYS, PAYMENT_STATUSES } from "@/lib/entities";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getPayments } from "@/lib/services";

import PaymentListFilterSection from "./components/PaymentListFilterSection";
import PaymentListTableSection from "./components/PaymentListTableSection";

import type {
  TPaymentGateway,
  TPaymentListPageFilter,
  TPaymentStatus,
} from "@/lib/entities";

const PAYMENT_INITIAL_FILTER: TPaymentListPageFilter = {
  invoiceNumber: "",
  occupantName: "",
  propertyId: "",
  status: "",
  gateway: "",
  paidFrom: "",
  paidTo: "",
  billId: "",
};

const PAYMENT_FILTER_KEYS = [
  "invoiceNumber",
  "occupantName",
  "propertyId",
  "status",
  "gateway",
  "paidFrom",
  "paidTo",
  "billId",
] as const;

const parseStatus = (value: string | null): TPaymentStatus | "" => {
  return value && PAYMENT_STATUSES.includes(value as TPaymentStatus)
    ? (value as TPaymentStatus)
    : "";
};

const parseGateway = (value: string | null): TPaymentGateway | "" => {
  return value && PAYMENT_GATEWAYS.includes(value as TPaymentGateway)
    ? (value as TPaymentGateway)
    : "";
};

const readFilterFromSearch = (searchParams: URLSearchParams): TPaymentListPageFilter => {
  return {
    invoiceNumber: searchParams.get("invoiceNumber") ?? "",
    occupantName: searchParams.get("occupantName") ?? "",
    propertyId: searchParams.get("propertyId") ?? "",
    status: parseStatus(searchParams.get("status")),
    gateway: parseGateway(searchParams.get("gateway")),
    paidFrom: searchParams.get("paidFrom") ?? "",
    paidTo: searchParams.get("paidTo") ?? "",
    billId: searchParams.get("billId") ?? "",
  };
};

const hasPaymentFilterValues = (filter: TPaymentListPageFilter) => {
  return PAYMENT_FILTER_KEYS.some((key) => Boolean(filter[key]?.toString().trim()));
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentsPageContent />
    </Suspense>
  );
}

function PaymentsPageContent() {
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [dateError, setDateError] = useState("");

  const pageQuery = searchParams.get("page");
  const appliedFilter = readFilterFromSearch(searchParams);
  const paramQuery = {
    page: pageQuery ? Number.parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...appliedFilter,
  };

  const [filter, setFilter] = useState<TPaymentListPageFilter>(appliedFilter);

  const constructQueryParam = (opt?: { page?: number }) => {
    return {
      page: opt?.page || DEFAULT_PAGINATION.page,
      invoiceNumber: filter.invoiceNumber?.trim() || null,
      occupantName: filter.occupantName?.trim() || null,
      propertyId: filter.propertyId?.trim() || null,
      status: filter.status || null,
      gateway: filter.gateway || null,
      paidFrom: filter.paidFrom?.trim() || null,
      paidTo: filter.paidTo?.trim() || null,
      billId: filter.billId?.trim() || null,
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
    setFilter(PAYMENT_INITIAL_FILTER);
    setDateError("");
    handleChangeQueryParam();
  };

  const handleSearch = () => {
    if (filter.paidFrom && filter.paidTo && filter.paidFrom > filter.paidTo) {
      setDateError(t("PaymentPage.filter.invalidDateRange"));
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

  const paymentsQuery = useQuery({
    queryKey: [...GET_PAYMENT_LIST_QUERY_KEY, paramQuery],
    queryFn: () =>
      getPayments({
        ...appliedFilter,
        page:
          Number.isFinite(paramQuery.page) && paramQuery.page > 0
            ? paramQuery.page
            : DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
      }),
  });

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("PaymentPage.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("PaymentPage.subtitle")}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <PaymentListFilterSection
          filter={filter}
          onFilterChange={(next) => {
            setDateError("");
            setFilter(next);
          }}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasPaymentFilterValues(filter) || hasPaymentFilterValues(appliedFilter)}
          isSearching={paymentsQuery.isFetching}
          error={dateError}
        />
        <PaymentListTableSection
          items={paymentsQuery.data?.items ?? []}
          pagination={paymentsQuery.data?.pagination ?? DEFAULT_PAGINATION}
          isLoading={paymentsQuery.isLoading}
          isError={paymentsQuery.isError}
          hasFilter={hasPaymentFilterValues(appliedFilter)}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
        />
      </div>
    </section>
  );
}
