"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { CurrencyInput, Select, TextArea, TextInput } from "@/components";
import {
  BILLS_ROUTE,
  GET_OCCUPANT_LIST_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
} from "@/lib/constants";
import { canEditManualBill, type TBill, type TBillFormSubmit } from "@/lib/entities";
import { parseCurrencyNumber, toCurrencyDigits, toDateInputValue } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getOccupants, getProperties } from "@/lib/services";

type TBillFormProps = {
  bill?: TBill;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (data: TBillFormSubmit) => void;
};

const INITIAL_FORM = {
  propertyId: "",
  occupantId: "",
  amount: "",
  dueDate: "",
  description: "",
};

type TFormValues = typeof INITIAL_FORM;
type TFormErrors = Partial<Record<keyof TFormValues, string>>;

const toFormValues = (bill?: TBill): TFormValues => {
  if (!bill) {
    return INITIAL_FORM;
  }

  return {
    propertyId: bill.occupant?.room?.property?.id ?? "",
    occupantId: bill.occupantId ?? bill.occupant?.id ?? "",
    amount: toCurrencyDigits(bill.amount),
    dueDate: toDateInputValue(bill.dueDate),
    description: bill.description ?? "",
  };
};

const parseAmount = (value: string) => {
  const amount = parseCurrencyNumber(value);

  if (amount === null || amount < 0) {
    return null;
  }

  return amount;
};

export function BillForm({ bill, isSubmitting, submitError, onSubmit }: TBillFormProps) {
  const { t } = useI18n();
  const isEdit = Boolean(bill);
  const [form, setForm] = useState<TFormValues>(() => toFormValues(bill));
  const [errors, setErrors] = useState<TFormErrors>({});

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
    enabled: !isEdit,
  });

  const occupantsQuery = useQuery({
    queryKey: [
      ...GET_OCCUPANT_LIST_QUERY_KEY,
      { page: 1, limit: 100, isActive: "true", propertyId: form.propertyId },
    ],
    queryFn: () =>
      getOccupants({
        page: 1,
        limit: 100,
        isActive: "true",
        propertyId: form.propertyId,
      }),
    enabled: !isEdit && Boolean(form.propertyId),
  });

  const properties = propertiesQuery.data?.items ?? [];
  const occupants = occupantsQuery.data?.items ?? [];

  useEffect(() => {
    if (bill) {
      setForm(toFormValues(bill));
    }
  }, [bill]);

  useEffect(() => {
    if (isEdit || form.propertyId || properties.length !== 1) {
      return;
    }

    setForm((current) => ({
      ...current,
      propertyId: properties[0].id,
    }));
  }, [form.propertyId, isEdit, properties]);

  const updateField = <K extends keyof TFormValues>(key: K, value: TFormValues[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "propertyId" ? { occupantId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: TFormErrors = {};

    if (!isEdit && !form.propertyId) {
      nextErrors.propertyId = t("BillPage.form.required");
    }

    if (!isEdit && !form.occupantId) {
      nextErrors.occupantId = t("BillPage.form.required");
    }

    if (parseAmount(form.amount) === null) {
      nextErrors.amount = t("BillPage.form.invalidAmount");
    }

    if (!form.dueDate) {
      nextErrors.dueDate = t("BillPage.form.required");
    }

    if (!form.description.trim()) {
      nextErrors.description = t("BillPage.form.required");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    const amount = parseAmount(form.amount);

    if (amount === null) return;

    onSubmit({
      occupantId: form.occupantId,
      payload: isEdit
        ? {
            amount,
            dueDate: form.dueDate,
            description: form.description.trim(),
          }
        : {
            occupantId: form.occupantId,
            amount,
            dueDate: form.dueDate,
            description: form.description.trim(),
          },
    });
  };

  if (isEdit && bill && !canEditManualBill(bill)) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white px-6 py-10 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
        <p className="text-sm font-medium text-ink">{t("BillPage.form.cannotEdit")}</p>
        <Link
          href={BILLS_ROUTE}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          {t("BillPage.form.back")}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
      onSubmit={handleSubmit}
    >
      {isEdit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="bill-invoice"
            label={t("BillPage.form.invoice")}
            value={bill?.invoiceNumber ?? ""}
            readOnly
          />
          <TextInput
            id="bill-occupant"
            label={t("BillPage.form.occupant")}
            value={bill?.occupant?.fullName ?? ""}
            readOnly
          />
          <TextInput
            id="bill-property"
            label={t("BillPage.form.property")}
            value={bill?.occupant?.room?.property?.name ?? ""}
            readOnly
          />
          <TextInput
            id="bill-room"
            label={t("BillPage.form.room")}
            value={bill?.occupant?.room?.name ?? ""}
            readOnly
          />
          <TextInput
            id="bill-type"
            label={t("BillPage.form.type")}
            value={bill ? t(`BillPage.type.${bill.type}`) : ""}
            readOnly
          />
          <TextInput
            id="bill-status"
            label={t("BillPage.form.status")}
            value={bill ? t(`BillPage.status.${bill.status}`) : ""}
            readOnly
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="bill-property"
            label={t("BillPage.form.property")}
            value={form.propertyId}
            error={errors.propertyId}
            onChange={(event) => {
              updateField("propertyId", event.target.value);
            }}
          >
            <option value="">{t("BillPage.form.propertyPlaceholder")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <div className="flex flex-col gap-2">
            <Select
              id="bill-occupant"
              label={t("BillPage.form.occupant")}
              value={form.occupantId}
              disabled={!form.propertyId || occupantsQuery.isLoading}
              error={errors.occupantId}
              onChange={(event) => {
                updateField("occupantId", event.target.value);
              }}
            >
              <option value="">{t("BillPage.form.occupantPlaceholder")}</option>
              {occupants.map((occupant) => (
                <option key={occupant.id} value={occupant.id}>
                  {occupant.room?.name
                    ? `${occupant.fullName} · ${occupant.room.name}`
                    : occupant.fullName}
                </option>
              ))}
            </Select>
            {form.propertyId && !occupantsQuery.isLoading && occupants.length === 0 ? (
              <p className="text-sm text-muted">{t("BillPage.form.noOccupants")}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput
          id="bill-amount"
          label={t("BillPage.form.amount")}
          placeholder={t("BillPage.form.amountPlaceholder")}
          value={form.amount}
          error={errors.amount}
          required
          onValueChange={(value) => updateField("amount", value)}
        />
        <TextInput
          id="bill-due-date"
          type="date"
          label={t("BillPage.form.dueDate")}
          value={form.dueDate}
          error={errors.dueDate}
          required
          onChange={(event) => updateField("dueDate", event.target.value)}
        />
      </div>

      <TextArea
        id="bill-description"
        label={t("BillPage.form.description")}
        placeholder={t("BillPage.form.descriptionPlaceholder")}
        value={form.description}
        error={errors.description}
        maxLength={255}
        required
        onChange={(event) => updateField("description", event.target.value)}
      />

      {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={BILLS_ROUTE}
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
