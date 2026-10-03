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
  GET_OCCUPANT_LIST_QUERY_KEY,
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  NEW_OCCUPANT_ROUTE,
} from "@/lib/constants";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { checkoutOccupant, deleteOccupant, getOccupants } from "@/lib/services";
import { toast } from "@/store";

import OccupantCheckoutDialog from "./components/OccupantCheckoutDialog";
import OccupantDeleteDialog from "./components/OccupantDeleteDialog";
import OccupantDetailDialog from "./components/OccupantDetailDialog";
import OccupantListFilterSection from "./components/OccupantListFilterSection";
import OccupantListTableSection from "./components/OccupantListTableSection";

import type { TOccupant, TOccupantActiveFilter, TOccupantListPageFilter } from "@/lib/entities";

const OCCUPANT_INITIAL_FILTER: TOccupantListPageFilter = {
  name: "",
  propertyId: "",
  isActive: "",
  checkInFrom: "",
  checkInTo: "",
};

const OCCUPANT_FILTER_KEYS = ["name", "propertyId", "isActive", "checkInFrom", "checkInTo"] as const;

const parseIsActive = (value: string | null): TOccupantActiveFilter | "" => {
  return value === "true" || value === "false" ? value : "";
};

const readFilterFromSearch = (searchParams: URLSearchParams): TOccupantListPageFilter => {
  return {
    name: searchParams.get("name") ?? "",
    propertyId: searchParams.get("propertyId") ?? "",
    isActive: parseIsActive(searchParams.get("isActive")),
    checkInFrom: searchParams.get("checkInFrom") ?? "",
    checkInTo: searchParams.get("checkInTo") ?? "",
  };
};

const hasOccupantFilterValues = (filter: TOccupantListPageFilter) => {
  return OCCUPANT_FILTER_KEYS.some((key) => Boolean(filter[key]?.toString().trim()));
};

export default function OccupantsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OccupantsPageContent />
    </Suspense>
  );
}

function OccupantsPageContent() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [occupantToDelete, setOccupantToDelete] = useState<TOccupant | null>(null);
  const [occupantToCheckout, setOccupantToCheckout] = useState<TOccupant | null>(null);
  const [occupantToDetail, setOccupantToDetail] = useState<TOccupant | null>(null);

  const pageQuery = searchParams.get("page");
  const appliedFilter = readFilterFromSearch(searchParams);
  const paramQuery = {
    page: pageQuery ? Number.parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...appliedFilter,
  };

  const [filter, setFilter] = useState<TOccupantListPageFilter>(appliedFilter);

  const constructQueryParam = (opt?: { page?: number }) => {
    return {
      page: opt?.page || DEFAULT_PAGINATION.page,
      name: filter.name?.trim() || null,
      propertyId: filter.propertyId?.trim() || null,
      isActive: filter.isActive || null,
      checkInFrom: filter.checkInFrom?.trim() || null,
      checkInTo: filter.checkInTo?.trim() || null,
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
    setFilter(OCCUPANT_INITIAL_FILTER);
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

  const occupantsQuery = useQuery({
    queryKey: [...GET_OCCUPANT_LIST_QUERY_KEY, paramQuery],
    queryFn: () =>
      getOccupants({
        ...appliedFilter,
        page:
          Number.isFinite(paramQuery.page) && paramQuery.page > 0
            ? paramQuery.page
            : DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
      }),
  });

  const invalidateOccupantQueries = (occupant?: TOccupant) => {
    void queryClient.invalidateQueries({
      queryKey: GET_OCCUPANT_LIST_QUERY_KEY,
    });
    void queryClient.invalidateQueries({
      queryKey: GET_ROOM_LIST_QUERY_KEY,
    });
    void queryClient.invalidateQueries({
      queryKey: GET_PROPERTY_LIST_QUERY_KEY,
    });
    if (occupant?.room?.property?.id) {
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, occupant.room.property.id],
      });
    }
  };

  const checkoutOccupantMutation = useMutation({
    mutationFn: ({ occupant, checkOut }: { occupant: TOccupant; checkOut: string }) => {
      return checkoutOccupant(occupant.id, { checkOut });
    },
    onSuccess: (_result, variables) => {
      invalidateOccupantQueries(variables.occupant);
      setOccupantToCheckout(null);
      toast.success(t("common.toast.checkedOut"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const deleteOccupantMutation = useMutation({
    mutationFn: (occupant: TOccupant) => {
      const propertyId = occupant.room?.property?.id;
      const roomId = occupant.roomId || occupant.room?.id;

      if (!propertyId || !roomId) {
        throw new Error("Missing property or room for this occupant.");
      }

      return deleteOccupant(propertyId, roomId, occupant.id);
    },
    onSuccess: (_result, occupant) => {
      invalidateOccupantQueries(occupant);
      setOccupantToDelete(null);
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
            {t("OccupantPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("OccupantPage.subtitle")}
          </p>
        </div>
        <Link
          href={NEW_OCCUPANT_ROUTE}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Icon icon="solar:add-circle-linear" className="size-5" />
          {t("OccupantPage.buttons.addOccupant")}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <OccupantListFilterSection
          filter={filter}
          onFilterChange={setFilter}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasOccupantFilterValues(filter) || hasOccupantFilterValues(appliedFilter)}
          isSearching={occupantsQuery.isFetching}
        />
        <OccupantListTableSection
          items={occupantsQuery.data?.items ?? []}
          pagination={occupantsQuery.data?.pagination ?? DEFAULT_PAGINATION}
          isLoading={occupantsQuery.isLoading}
          isError={occupantsQuery.isError}
          hasFilter={hasOccupantFilterValues(appliedFilter)}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
          onCheckout={setOccupantToCheckout}
          onDelete={setOccupantToDelete}
          onDetail={setOccupantToDetail}
        />
      </div>
      <OccupantDetailDialog
        occupant={occupantToDetail}
        onCancel={() => {
          setOccupantToDetail(null);
        }}
      />
      <OccupantCheckoutDialog
        occupant={occupantToCheckout}
        isCheckingOut={checkoutOccupantMutation.isPending}
        error={checkoutOccupantMutation.error?.message}
        onCancel={() => {
          if (checkoutOccupantMutation.isPending) return;
          setOccupantToCheckout(null);
          checkoutOccupantMutation.reset();
        }}
        onConfirm={(checkOut) => {
          if (!occupantToCheckout) return;
          checkoutOccupantMutation.mutate({
            occupant: occupantToCheckout,
            checkOut,
          });
        }}
      />
      <OccupantDeleteDialog
        occupant={occupantToDelete}
        isDeleting={deleteOccupantMutation.isPending}
        error={deleteOccupantMutation.error?.message}
        onCancel={() => {
          if (deleteOccupantMutation.isPending) return;
          setOccupantToDelete(null);
          deleteOccupantMutation.reset();
        }}
        onConfirm={() => {
          if (!occupantToDelete) return;
          deleteOccupantMutation.mutate(occupantToDelete);
        }}
      />
    </section>
  );
}
