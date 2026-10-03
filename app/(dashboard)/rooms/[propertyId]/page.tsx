"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import type { ParsedUrlQueryInput } from "querystring";

import { Loading } from "@/components/Loading";
import {
  DEFAULT_PAGINATION,
  GET_PROPERTY_DETAIL_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  ROOMS_ROUTE,
  getNewRoomRoute,
} from "@/lib/constants";
import { buildPathnameWithQueryPath } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { deleteRoom, getProperty, getRooms, updateRoom } from "@/lib/services";
import { toast } from "@/store";

import RoomDeleteDialog from "../components/RoomDeleteDialog";
import RoomInventoryDialog from "../components/RoomInventoryDialog";
import RoomListFilterSection from "../components/RoomListFilterSection";
import RoomListTableSection from "../components/RoomListTableSection";

import type {
  TInventoryCondition,
  TInventoryStatus,
  TRoom,
  TRoomInventoryPayload,
  TRoomListPageFilter,
  TRoomStatusFilter,
} from "@/lib/entities";

const ROOM_INITIAL_FILTER: TRoomListPageFilter = {
  occupantName: "",
  name: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minLength: "",
  maxLength: "",
  minWidth: "",
  maxWidth: "",
  inventories: "",
  inventoryStatus: "",
  inventoryCondition: "",
};

const ROOM_FILTER_KEYS = [
  "occupantName",
  "name",
  "status",
  "minPrice",
  "maxPrice",
  "minLength",
  "maxLength",
  "minWidth",
  "maxWidth",
  "inventories",
  "inventoryStatus",
  "inventoryCondition",
] as const;

const parseStatus = (value: string | null): TRoomStatusFilter | "" => {
  return value === "available" || value === "occupied" ? value : "";
};

const parseInventoryStatus = (value: string | null): TInventoryStatus | "" => {
  return value === "FUNCTIONAL" || value === "REPAIRING" ? value : "";
};

const parseInventoryCondition = (value: string | null): TInventoryCondition | "" => {
  return value === "GOOD" || value === "FAIR" || value === "POOR" ? value : "";
};

const readFilterFromSearch = (searchParams: URLSearchParams): TRoomListPageFilter => {
  return {
    occupantName: searchParams.get("occupantName") ?? "",
    name: searchParams.get("name") ?? "",
    status: parseStatus(searchParams.get("status")),
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minLength: searchParams.get("minLength") ?? "",
    maxLength: searchParams.get("maxLength") ?? "",
    minWidth: searchParams.get("minWidth") ?? "",
    maxWidth: searchParams.get("maxWidth") ?? "",
    inventories: searchParams.get("inventories") ?? "",
    inventoryStatus: parseInventoryStatus(searchParams.get("inventoryStatus")),
    inventoryCondition: parseInventoryCondition(searchParams.get("inventoryCondition")),
  };
};

const hasRoomFilterValues = (filter: TRoomListPageFilter) => {
  return ROOM_FILTER_KEYS.some((key) => Boolean(filter[key]?.toString().trim()));
};

export default function PropertyRoomsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PropertyRoomsPageContent params={params} />
    </Suspense>
  );
}

function PropertyRoomsPageContent({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [roomToDelete, setRoomToDelete] = useState<TRoom | null>(null);
  const [roomToInventory, setRoomToInventory] = useState<TRoom | null>(null);

  const pageQuery = searchParams.get("page");
  const appliedFilter = readFilterFromSearch(searchParams);
  const paramQuery = {
    page: pageQuery ? Number.parseInt(pageQuery, 10) : DEFAULT_PAGINATION.page,
    ...appliedFilter,
  };

  const [filter, setFilter] = useState<TRoomListPageFilter>(appliedFilter);

  const constructQueryParam = (opt?: { page?: number }) => {
    return {
      page: opt?.page || DEFAULT_PAGINATION.page,
      occupantName: filter.occupantName?.trim() || null,
      name: filter.name?.trim() || null,
      status: filter.status || null,
      minPrice: filter.minPrice?.trim() || null,
      maxPrice: filter.maxPrice?.trim() || null,
      minLength: filter.minLength?.trim() || null,
      maxLength: filter.maxLength?.trim() || null,
      minWidth: filter.minWidth?.trim() || null,
      maxWidth: filter.maxWidth?.trim() || null,
      inventories: filter.inventories?.trim() || null,
      inventoryStatus: filter.inventoryStatus || null,
      inventoryCondition: filter.inventoryCondition || null,
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
    setFilter(ROOM_INITIAL_FILTER);
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

  const propertyQuery = useQuery({
    queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
    queryFn: () => getProperty(propertyId),
  });

  const roomsQuery = useQuery({
    queryKey: [...GET_ROOM_LIST_QUERY_KEY, propertyId, paramQuery],
    queryFn: () =>
      getRooms(propertyId, {
        ...appliedFilter,
        page: Number.isFinite(paramQuery.page) && paramQuery.page > 0
          ? paramQuery.page
          : DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
      }),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({
      room,
      inventories,
    }: {
      room: TRoom;
      inventories: TRoomInventoryPayload[];
    }) => {
      return updateRoom(propertyId, room.id, {
        name: room.name,
        price: Number(room.price) || 0,
        inventories,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: GET_ROOM_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
      });
      setRoomToInventory(null);
      toast.success(t("common.toast.updated"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => deleteRoom(propertyId, roomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: GET_ROOM_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: GET_PROPERTY_LIST_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...GET_PROPERTY_DETAIL_QUERY_KEY, propertyId],
      });
      setRoomToDelete(null);
      setRoomToInventory(null)
      toast.success(t("common.toast.deleted"));
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-6xl">
      <Link
        href={ROOMS_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("RoomPage.allProperties")}
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {propertyQuery.data?.name ?? t("RoomPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("RoomPage.subtitle")}
          </p>
        </div>
        <Link
          href={getNewRoomRoute(propertyId)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Icon icon="solar:add-circle-linear" className="size-5" />
          {t("RoomPage.buttons.addRoom")}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <RoomListFilterSection
          filter={filter}
          onFilterChange={setFilter}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          canReset={hasRoomFilterValues(filter) || hasRoomFilterValues(appliedFilter)}
          isSearching={roomsQuery.isFetching}
        />
        <RoomListTableSection
          items={roomsQuery.data?.items ?? []}
          propertyId={propertyId}
          pagination={roomsQuery.data?.pagination ?? DEFAULT_PAGINATION}
          isLoading={roomsQuery.isLoading}
          isError={roomsQuery.isError}
          hasFilter={hasRoomFilterValues(appliedFilter)}
          onRetry={handleRetry}
          onPageChange={handleChangePage}
          onDetail={setRoomToInventory}
        />
      </div>
      <RoomInventoryDialog
        room={roomToInventory}
        isSaving={updateInventoryMutation.isPending}
        error={updateInventoryMutation.error?.message}
        onCancel={() => {
          if (updateInventoryMutation.isPending) return;
          setRoomToInventory(null);
          updateInventoryMutation.reset();
        }}
        onSave={(inventories) => {
          if (!roomToInventory) return;
          updateInventoryMutation.mutate({
            room: roomToInventory,
            inventories,
          });
        }}
        onDelete={setRoomToDelete}
      />
      <RoomDeleteDialog
        room={roomToDelete}
        isDeleting={deleteRoomMutation.isPending}
        error={deleteRoomMutation.error?.message}
        onCancel={() => {
          if (deleteRoomMutation.isPending) return;
          setRoomToDelete(null);
          deleteRoomMutation.reset();
        }}
        onConfirm={() => {
          if (!roomToDelete) return;
          deleteRoomMutation.mutate(roomToDelete.id);
        }}
      />
    </section>
  );
}
