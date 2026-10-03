"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import type { ParsedUrlQueryInput } from "querystring";

import { DEFAULT_PAGINATION, GET_PROPERTY_LIST_QUERY_KEY, NEW_PROPERTY_ROUTE } from "@/lib/constants";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { deleteProperty, getProperties } from "@/lib/services";
import { toast } from "@/store";

import PropertyDeleteDialog from "./components/PropertyDeleteDialog";
import PropertyListFilterSection from "./components/PropertyListFilterSection";
import PropertyListTableSection from "./components/PropertyListTableSection";

import type { TPagination, TProperty, TPropertyListPageFilter } from "@/lib/entities";

const PROPERTY_INITIAL_FILTER: TPropertyListPageFilter = {
  name: "",
  lateFee: "",
};

export default function PropertiesPage() {
  const { t } = useI18n();
  
  const queryClient = useQueryClient();
  const [propertyToDelete, setPropertyToDelete] = useState<TProperty | null>(null);

  const pahtname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const pageQuery = searchParams.get("page");
  const nameQuery = searchParams.get("name");
  const lateFeeQuery = searchParams.get("lateFee");

  const paramQuery = {
    page: pageQuery ? parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...(nameQuery && { name: nameQuery as string }),
    ...(lateFeeQuery && { lateFee: lateFeeQuery as string }),
  }

  const [filter, setFilter] = useState<TPropertyListPageFilter>({
    name: paramQuery.name,
    lateFee: paramQuery.lateFee,
  });

  const constructQueryParam = (opt?: {
    page?: number;
  }) => {
    const { page } = opt || {};
    return {
      page: page || DEFAULT_PAGINATION.page,
      ...(filter?.name && { name: filter.name.trim() }),
      ...(filter?.lateFee && { lateFee: filter.lateFee.trim() }),
    };
  };

  const {
    data: propertyResponse,
    isLoading,
    isError: isPropertyListError,
  } = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, paramQuery],
    queryFn: () => getProperties({
      ...paramQuery,
      limit: DEFAULT_PAGINATION.limit,
    }),
  })

  const handleChangeQueryParam = (query?: string | ParsedUrlQueryInput | null) => {
    const url = typeof query === 'string' ? query : buildPathnameWithQueryPath(pahtname, searchParams, query);

    window.history.pushState(null, '', url);
  }

  const handleResetFilter = () => {
    setFilter(PROPERTY_INITIAL_FILTER);
    handleChangeQueryParam()
  }

  const handleSearch = () => {
    handleChangeQueryParam(constructQueryParam());
  }

  const handleRetry = () => {
    handleChangeQueryParam(constructQueryParam());
  }

  const handleChangePage = (newPage: number) => {
    handleChangeQueryParam(
      constructQueryParam({ page: newPage })
    )
  }

  const deletePropertyMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      setPropertyToDelete(null);
      toast.success(t("common.toast.deleted"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const hasDraftFilter = Boolean(filter.name?.trim() || filter.lateFee);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("PropertyPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("PropertyPage.subtitle")}
          </p>
        </div>
        <Link
          href={NEW_PROPERTY_ROUTE}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Icon icon="solar:add-circle-linear" className="size-5" />
          {t("PropertyPage.buttons.addProperty")}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <PropertyListFilterSection
          filter={filter}
          onFilterChange={setFilter}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasDraftFilter}
        />
        <PropertyListTableSection
          items={propertyResponse?.items ?? []}
          pagination={propertyResponse?.pagination ?? DEFAULT_PAGINATION}
          isLoading={isLoading}
          isError={isPropertyListError}
          hasFilter={false}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
          onDelete={setPropertyToDelete}
        />
      </div>
      <PropertyDeleteDialog
        property={propertyToDelete}
        isDeleting={deletePropertyMutation.isPending}
        error={deletePropertyMutation.error?.message}
        onCancel={() => {
          if (deletePropertyMutation.isPending) return;
          setPropertyToDelete(null);
          deletePropertyMutation.reset();
        }}
        onConfirm={() => {
          if (!propertyToDelete) return;
          deletePropertyMutation.mutate(propertyToDelete.id);
        }}
      />
    </section>
  );
}
