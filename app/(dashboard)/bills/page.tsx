"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import type { ParsedUrlQueryInput } from "querystring";

import { Loading } from "@/components/Loading";
import {
  DEFAULT_PAGINATION,
  GET_BILL_LIST_QUERY_KEY,
  GET_DASHBOARD_SUMMARY_QUERY_KEY,
  NEW_BILL_ROUTE,
} from "@/lib/constants";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { ConfirmDialog } from "@/components";
import {
  cancelBill,
  generateMissingBills,
  getBills,
  markBillPaidCash,
  processOverdueBills,
  sendBillReminders,
} from "@/lib/services";
import { toast } from "@/store";

import BillListFilterSection from "./components/BillListFilterSection";
import BillListTableSection from "./components/BillListTableSection";

import type { TBill, TBillListPageFilter, TBillStatus, TBillType } from "@/lib/entities";

type TBillJob = "overdue" | "generate" | "reminders" | null;

const BILL_INITIAL_FILTER: TBillListPageFilter = {
  invoiceNumber: "",
  occupantName: "",
  propertyId: "",
  status: "",
  type: "",
  dueDateFrom: "",
  dueDateTo: "",
};

const BILL_FILTER_KEYS = [
  "invoiceNumber",
  "occupantName",
  "propertyId",
  "status",
  "type",
  "dueDateFrom",
  "dueDateTo",
] as const;

const BILL_STATUSES: TBillStatus[] = ["UNPAID", "PENDING", "PAID", "OVERDUE", "CANCELLED"];
const BILL_TYPES: TBillType[] = ["RENT", "MANUAL", "BOOKING"];

const parseStatus = (value: string | null): TBillStatus | "" => {
  return value && BILL_STATUSES.includes(value as TBillStatus)
    ? (value as TBillStatus)
    : "";
};

const parseType = (value: string | null): TBillType | "" => {
  return value && BILL_TYPES.includes(value as TBillType) ? (value as TBillType) : "";
};

const readFilterFromSearch = (searchParams: URLSearchParams): TBillListPageFilter => {
  return {
    invoiceNumber: searchParams.get("invoiceNumber") ?? "",
    occupantName: searchParams.get("occupantName") ?? "",
    propertyId: searchParams.get("propertyId") ?? "",
    status: parseStatus(searchParams.get("status")),
    type: parseType(searchParams.get("type")),
    dueDateFrom: searchParams.get("dueDateFrom") ?? "",
    dueDateTo: searchParams.get("dueDateTo") ?? "",
  };
};

const hasBillFilterValues = (filter: TBillListPageFilter) => {
  return BILL_FILTER_KEYS.some((key) => Boolean(filter[key]?.toString().trim()));
};

export default function BillsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BillsPageContent />
    </Suspense>
  );
}

function BillsPageContent() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [activeJob, setActiveJob] = useState<TBillJob>(null);
  const [billToCancel, setBillToCancel] = useState<TBill | null>(null);
  const [billToPayCash, setBillToPayCash] = useState<TBill | null>(null);

  const pageQuery = searchParams.get("page");
  const appliedFilter = readFilterFromSearch(searchParams);
  const paramQuery = {
    page: pageQuery ? Number.parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...appliedFilter,
  };

  const [filter, setFilter] = useState<TBillListPageFilter>(appliedFilter);

  const constructQueryParam = (opt?: { page?: number }) => {
    return {
      page: opt?.page || DEFAULT_PAGINATION.page,
      invoiceNumber: filter.invoiceNumber?.trim() || null,
      occupantName: filter.occupantName?.trim() || null,
      propertyId: filter.propertyId?.trim() || null,
      status: filter.status || null,
      type: filter.type || null,
      dueDateFrom: filter.dueDateFrom?.trim() || null,
      dueDateTo: filter.dueDateTo?.trim() || null,
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
    setFilter(BILL_INITIAL_FILTER);
    handleChangeQueryParam();
  };

  const handleSearch = () => {
    handleChangeQueryParam(constructQueryParam());
  };

  const handleRetry = () => {
    handleChangeQueryParam(constructQueryParam());
  };

  const handleChangePage = (newPage: number) => {
    handleChangeQueryParam(constructQueryParam({ page: newPage }));
  };

  const invalidateBills = () => {
    void queryClient.invalidateQueries({
      queryKey: GET_BILL_LIST_QUERY_KEY,
    });
    void queryClient.invalidateQueries({
      queryKey: GET_DASHBOARD_SUMMARY_QUERY_KEY,
    });
  };

  const processOverdueMutation = useMutation({
    mutationFn: processOverdueBills,
    onSuccess: (result) => {
      if (!result) return;

      toast.success(
        t("BillPage.processOverdue.success", {
          marked: result.markedOverdue,
          fees: result.lateFeesApplied,
        }),
      );
      setActiveJob(null);
      invalidateBills();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const generateMissingMutation = useMutation({
    mutationFn: generateMissingBills,
    onSuccess: (result) => {
      if (!result) return;

      toast.success(
        t("BillPage.generateMissing.success", {
          created: result.created,
        }),
      );
      setActiveJob(null);
      invalidateBills();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const sendRemindersMutation = useMutation({
    mutationFn: sendBillReminders,
    onSuccess: (result) => {
      if (!result) return;

      toast.success(
        t("BillPage.sendReminders.success", {
          sent: result.sent,
          skipped: result.skipped,
          failed: result.failed,
        }),
      );
      setActiveJob(null);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const cancelBillMutation = useMutation({
    mutationFn: (bill: TBill) => cancelBill(bill.id),
    onSuccess: () => {
      setBillToCancel(null);
      invalidateBills();
      toast.success(t("common.toast.billCancelled"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const markPaidCashMutation = useMutation({
    mutationFn: (bill: TBill) => markBillPaidCash(bill.id),
    onSuccess: () => {
      setBillToPayCash(null);
      invalidateBills();
      toast.success(t("common.toast.billPaidCash"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const billsQuery = useQuery({
    queryKey: [...GET_BILL_LIST_QUERY_KEY, paramQuery],
    queryFn: () =>
      getBills({
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("BillPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("BillPage.subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => {
              generateMissingMutation.reset();
              setActiveJob("generate");
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <Icon icon="solar:document-add-linear" className="size-5" />
            {t("BillPage.buttons.generateMissing")}
          </button>
          <button
            type="button"
            onClick={() => {
              sendRemindersMutation.reset();
              setActiveJob("reminders");
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <Icon icon="solar:letter-linear" className="size-5" />
            {t("BillPage.buttons.sendReminders")}
          </button>
          <button
            type="button"
            onClick={() => {
              processOverdueMutation.reset();
              setActiveJob("overdue");
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <Icon icon="solar:clock-circle-linear" className="size-5" />
            {t("BillPage.buttons.processOverdue")}
          </button>
          <Link
            href={NEW_BILL_ROUTE}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Icon icon="solar:add-circle-linear" className="size-5" />
            {t("BillPage.buttons.addManual")}
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <BillListFilterSection
          filter={filter}
          onFilterChange={setFilter}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasBillFilterValues(filter) || hasBillFilterValues(appliedFilter)}
          isSearching={billsQuery.isFetching}
        />
        <BillListTableSection
          items={billsQuery.data?.items ?? []}
          pagination={billsQuery.data?.pagination ?? DEFAULT_PAGINATION}
          isLoading={billsQuery.isLoading}
          isError={billsQuery.isError}
          hasFilter={hasBillFilterValues(appliedFilter)}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
          onCancel={setBillToCancel}
          onMarkPaidCash={setBillToPayCash}
        />
      </div>
      <ConfirmDialog
        isOpen={activeJob === "generate"}
        title={t("BillPage.generateMissing.title")}
        description={t("BillPage.generateMissing.description")}
        confirmLabel={t("BillPage.generateMissing.confirm")}
        icon="solar:document-add-linear"
        tone="primary"
        isProcessing={generateMissingMutation.isPending}
        error={generateMissingMutation.error?.message}
        onCancel={() => {
          if (generateMissingMutation.isPending) return;
          setActiveJob(null);
          generateMissingMutation.reset();
        }}
        onConfirm={() => {
          generateMissingMutation.mutate();
        }}
      />
      <ConfirmDialog
        isOpen={activeJob === "reminders"}
        title={t("BillPage.sendReminders.title")}
        description={t("BillPage.sendReminders.description")}
        confirmLabel={t("BillPage.sendReminders.confirm")}
        icon="solar:letter-linear"
        tone="primary"
        isProcessing={sendRemindersMutation.isPending}
        error={sendRemindersMutation.error?.message}
        onCancel={() => {
          if (sendRemindersMutation.isPending) return;
          setActiveJob(null);
          sendRemindersMutation.reset();
        }}
        onConfirm={() => {
          sendRemindersMutation.mutate();
        }}
      />
      <ConfirmDialog
        isOpen={activeJob === "overdue"}
        title={t("BillPage.processOverdue.title")}
        description={t("BillPage.processOverdue.description")}
        confirmLabel={t("BillPage.processOverdue.confirm")}
        icon="solar:clock-circle-linear"
        tone="warning"
        isProcessing={processOverdueMutation.isPending}
        error={processOverdueMutation.error?.message}
        onCancel={() => {
          if (processOverdueMutation.isPending) return;
          setActiveJob(null);
          processOverdueMutation.reset();
        }}
        onConfirm={() => {
          processOverdueMutation.mutate();
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(billToCancel)}
        title={t("BillPage.cancel.title")}
        description={t("BillPage.cancel.description", {
          invoice: billToCancel?.invoiceNumber ?? "",
        })}
        confirmLabel={t("BillPage.cancel.confirm")}
        icon="solar:close-circle-linear"
        tone="danger"
        isProcessing={cancelBillMutation.isPending}
        error={cancelBillMutation.error?.message}
        onCancel={() => {
          if (cancelBillMutation.isPending) return;
          setBillToCancel(null);
          cancelBillMutation.reset();
        }}
        onConfirm={() => {
          if (!billToCancel) return;
          cancelBillMutation.mutate(billToCancel);
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(billToPayCash)}
        title={t("BillPage.payCash.title")}
        description={t("BillPage.payCash.description", {
          invoice: billToPayCash?.invoiceNumber ?? "",
        })}
        confirmLabel={t("BillPage.payCash.confirm")}
        icon="solar:wad-of-money-linear"
        tone="primary"
        isProcessing={markPaidCashMutation.isPending}
        error={markPaidCashMutation.error?.message}
        onCancel={() => {
          if (markPaidCashMutation.isPending) return;
          setBillToPayCash(null);
          markPaidCashMutation.reset();
        }}
        onConfirm={() => {
          if (!billToPayCash) return;
          markPaidCashMutation.mutate(billToPayCash);
        }}
      />
    </section>
  );
}
