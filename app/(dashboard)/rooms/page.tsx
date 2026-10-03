"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Loading } from "@/components/Loading";
import {
  GET_PROPERTY_LIST_QUERY_KEY,
  NEW_PROPERTY_ROUTE,
  getPropertyRoomsRoute,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperties } from "@/lib/services";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
} from "@/components";

export default function RoomsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });

  const properties = propertiesQuery.data?.items ?? [];

  useEffect(() => {
    if (properties.length === 1) {
      router.replace(getPropertyRoomsRoute(properties[0].id));
    }
  }, [properties, router]);

  if (propertiesQuery.isLoading || properties.length === 1) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("RoomPage.pickTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("RoomPage.pickSubtitle")}
        </p>
        <div className="mt-6 rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <Loading />
        </div>
      </section>
    );
  }

  if (propertiesQuery.isError) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("RoomPage.pickTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("RoomPage.pickSubtitle")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <p className="text-sm font-medium text-ink">{t("RoomPage.emptyProperties")}</p>
          <button
            type="button"
            onClick={() => {
              void propertiesQuery.refetch();
            }}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t("common.button.retry")}
          </button>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("RoomPage.pickTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("RoomPage.pickSubtitle")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon icon="solar:buildings-2-linear" className="size-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink">{t("RoomPage.emptyProperties")}</p>
          <p className="mt-1 text-sm text-muted">{t("RoomPage.emptyPropertiesHelper")}</p>
          <Link
            href={NEW_PROPERTY_ROUTE}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t("PropertyPage.buttons.addProperty")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {t("RoomPage.pickTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("RoomPage.pickSubtitle")}
      </p>
      <div className="mt-6">
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>{t("PropertyPage.table.columns.property")}</DataTableHeaderCell>
              <DataTableHeaderCell>{t("PropertyPage.table.columns.address")}</DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">
                {t("PropertyPage.table.columns.rooms")}
              </DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">
                {t("PropertyPage.table.columns.occupied")}
              </DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">
                {t("PropertyPage.table.columns.available")}
              </DataTableHeaderCell>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {properties.map((property) => {
              const rooms = property.rooms ?? [];
              const occupied = rooms.filter((room) => room.occupant !== null).length;

              return (
                <tr key={property.id} className="hover:bg-slate-50/70">
                  <DataTableCell>
                    <Link
                      href={getPropertyRoomsRoute(property.id)}
                      className="font-semibold text-ink transition hover:text-primary"
                    >
                      {property.name}
                    </Link>
                  </DataTableCell>
                  <DataTableCell className="max-w-64 truncate text-muted">
                    {property.address}
                  </DataTableCell>
                  <DataTableCell className="text-center">{rooms.length}</DataTableCell>
                  <DataTableCell className="text-center">{occupied}</DataTableCell>
                  <DataTableCell className="text-center">{rooms.length - occupied}</DataTableCell>
                </tr>
              );
            })}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
