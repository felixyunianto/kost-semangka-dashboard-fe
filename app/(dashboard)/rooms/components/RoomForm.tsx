"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import { CurrencyInput } from "@/components";
import { TextArea, TextInput } from "@/components/TextInput";
import { getPropertyRoomsRoute } from "@/lib/constants";
import {
  type TCreateRoomPayload,
  type TInventoryCondition,
  type TInventoryStatus,
  type TRoom,
  type TRoomInventory,
  type TRoomInventoryPayload,
} from "@/lib/entities";
import { parseCurrencyNumber, toCurrencyDigits } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import { RoomInventoryList } from "./RoomInventoryList";

type TRoomFormProps = {
  propertyId: string;
  room?: TRoom;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (payload: TCreateRoomPayload) => void;
};

const INITIAL_INVENTORY_DRAFT = {
  name: "",
  condition: "GOOD" as TInventoryCondition,
  status: "FUNCTIONAL" as TInventoryStatus,
};

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  type: "",
  length: "",
  width: "",
  inventories: [] as TRoomInventory[],
};

type TFormValues = typeof INITIAL_FORM;
type TFormErrors = Partial<Record<keyof TFormValues, string>>;
type TInventoryDraft = typeof INITIAL_INVENTORY_DRAFT;

const toOptionalNumber = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const toInventories = (room?: TRoom): TRoomInventory[] => {
  return (room?.inventories ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    condition: item.condition,
    status: item.status ?? "FUNCTIONAL",
  }));
};

const toFormValues = (room?: TRoom): TFormValues => {
  if (!room) {
    return INITIAL_FORM;
  }

  return {
    name: room.name,
    description: room.description ?? "",
    price: toCurrencyDigits(room.price),
    type: room.type ?? "",
    length: room.length !== undefined && room.length !== null ? String(room.length) : "",
    width: room.width !== undefined && room.width !== null ? String(room.width) : "",
    inventories: toInventories(room),
  };
};

const toInventoryPayloads = (inventories: TRoomInventory[]): TRoomInventoryPayload[] => {
  return inventories
    .map((item) => ({
      name: item.name.trim(),
      condition: item.condition,
      status: item.status,
    }))
    .filter((item) => item.name.length > 0);
};

const toPayload = (form: TFormValues, isEdit: boolean): TCreateRoomPayload => {
  const length = toOptionalNumber(form.length);
  const width = toOptionalNumber(form.width);

  return {
    name: form.name.trim(),
    price: parseCurrencyNumber(form.price) ?? 0,
    ...(isEdit || form.description.trim()
      ? { description: form.description.trim() }
      : {}),
    ...(isEdit || form.type.trim() ? { type: form.type.trim() } : {}),
    ...(length !== undefined && { length }),
    ...(width !== undefined && { width }),
    inventories: toInventoryPayloads(form.inventories),
  };
};

export function RoomForm({
  propertyId,
  room,
  isSubmitting,
  submitError,
  onSubmit,
}: TRoomFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<TFormValues>(() => toFormValues(room));
  const [errors, setErrors] = useState<TFormErrors>({});
  const [inventoryDraft, setInventoryDraft] = useState<TInventoryDraft>(INITIAL_INVENTORY_DRAFT);
  const isEdit = Boolean(room);
  const backHref = getPropertyRoomsRoute(propertyId);

  useEffect(() => {
    if (room) {
      setForm(toFormValues(room));
    }
  }, [room]);

  const updateField = <K extends keyof TFormValues>(
    key: K,
    value: TFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const addInventory = (draft: TInventoryDraft) => {
    const name = draft.name.trim();

    if (!name) {
      setInventoryDraft((current) => ({ ...current, name: "" }));
      return form.inventories;
    }

    const exists = form.inventories.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      setInventoryDraft(INITIAL_INVENTORY_DRAFT);
      return form.inventories;
    }

    const nextInventories = [
      ...form.inventories,
      {
        name,
        condition: draft.condition,
        status: draft.status,
      },
    ];

    updateField("inventories", nextInventories);
    setInventoryDraft(INITIAL_INVENTORY_DRAFT);

    return nextInventories;
  };

  const validate = (values: TFormValues) => {
    const nextErrors: TFormErrors = {};
    const price = parseCurrencyNumber(values.price);

    if (!values.name.trim()) {
      nextErrors.name = t("RoomPage.form.required");
    }

    if (price === null) {
      nextErrors.price = values.price.trim()
        ? t("RoomPage.form.invalidNumber")
        : t("RoomPage.form.required");
    }

    const length = toOptionalNumber(values.length);
    const width = toOptionalNumber(values.width);

    if (values.length.trim() && (length === undefined || length < 0)) {
      nextErrors.length = t("RoomPage.form.invalidNumber");
    }

    if (values.width.trim() && (width === undefined || width < 0)) {
      nextErrors.width = t("RoomPage.form.invalidNumber");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inventories = addInventory(inventoryDraft);
    const nextForm = {
      ...form,
      inventories,
    };

    setForm(nextForm);

    if (!validate(nextForm)) return;

    onSubmit(toPayload(nextForm, isEdit));
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="room-name"
          label={t("RoomPage.form.name")}
          placeholder={t("RoomPage.form.namePlaceholder")}
          value={form.name}
          error={errors.name}
          maxLength={100}
          required
          onChange={(event) => updateField("name", event.target.value)}
        />
        <TextInput
          id="room-type"
          label={t("RoomPage.form.type")}
          placeholder={t("RoomPage.form.typePlaceholder")}
          value={form.type}
          error={errors.type}
          maxLength={50}
          onChange={(event) => updateField("type", event.target.value)}
        />
      </div>

      <CurrencyInput
        id="room-price"
        label={t("RoomPage.form.price")}
        placeholder={t("RoomPage.form.pricePlaceholder")}
        value={form.price}
        error={errors.price}
        required
        onValueChange={(value) => updateField("price", value)}
      />

      <TextArea
        id="room-description"
        label={t("RoomPage.form.description")}
        placeholder={t("RoomPage.form.descriptionPlaceholder")}
        value={form.description}
        error={errors.description}
        onChange={(event) => updateField("description", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="room-length"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          label={t("RoomPage.form.length")}
          placeholder={t("RoomPage.filter.numberPlaceholder")}
          value={form.length}
          error={errors.length}
          onChange={(event) => updateField("length", event.target.value)}
        />
        <TextInput
          id="room-width"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          label={t("RoomPage.form.width")}
          placeholder={t("RoomPage.filter.numberPlaceholder")}
          value={form.width}
          error={errors.width}
          onChange={(event) => updateField("width", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{t("RoomPage.form.inventorySection")}</p>
          <p className="mt-1 text-sm text-muted">{t("RoomPage.form.inventoryHelper")}</p>
        </div>

        {form.inventories.length > 0 ? (
          <div className="rounded-2xl border border-slate-100 px-3 sm:px-4">
            <RoomInventoryList
              items={form.inventories}
              onChange={(inventories) => {
                updateField("inventories", inventories);
              }}
              onRemove={(index) => {
                updateField(
                  "inventories",
                  form.inventories.filter((_, itemIndex) => itemIndex !== index),
                );
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t("RoomPage.form.inventoryEmpty")}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <TextInput
              id="room-inventory-name"
              label={t("RoomPage.form.inventoryName")}
              placeholder={t("RoomPage.form.inventoryNamePlaceholder")}
              value={inventoryDraft.name}
              maxLength={100}
              onChange={(event) => {
                setInventoryDraft((current) => ({ ...current, name: event.target.value }));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addInventory(inventoryDraft);
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              addInventory(inventoryDraft);
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <Icon icon="solar:add-circle-linear" className="size-5" />
            {t("RoomPage.form.inventoryAdd")}
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="text-sm text-red-700">{submitError}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={backHref}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          {t("common.button.cancel")}
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Icon
            icon={isEdit ? "solar:pen-linear" : "solar:add-circle-linear"}
            className="size-5"
          />
          {t("common.button.save")}
        </button>
      </div>
    </form>
  );
}
