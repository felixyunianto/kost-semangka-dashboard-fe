"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { CurrencyInput, Select, TextArea, TextInput } from "@/components";
import {
  EXPENSES_ROUTE,
  GET_FINANCE_CATEGORIES_QUERY_KEY,
  GET_PROPERTY_LIST_QUERY_KEY,
  INCOMES_ROUTE,
} from "@/lib/constants";
import { FINANCE_CATEGORIES } from "@/lib/entities";
import { parseCurrencyNumber, toCurrencyDigits, toDateInputValue } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFinanceCategories, getProperties } from "@/lib/services";

import type {
  TFinanceCategory,
  TFinanceEntry,
  TFinanceEntryFormSubmit,
  TFinanceKind,
} from "@/lib/entities";

type TFinanceEntryFormProps = {
  kind: TFinanceKind;
  entry?: TFinanceEntry;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (data: TFinanceEntryFormSubmit) => void;
};

const todayInputValue = () => toDateInputValue(new Date().toISOString());

const INITIAL_FORM = {
  propertyId: "",
  category: "" as TFinanceCategory | "",
  amount: "",
  occurredAt: todayInputValue(),
  description: "",
  notes: "",
};

type TFormValues = typeof INITIAL_FORM;
type TFormErrors = Partial<Record<keyof TFormValues, string>>;

const toFormValues = (entry?: TFinanceEntry): TFormValues => {
  if (!entry) {
    return INITIAL_FORM;
  }

  return {
    propertyId: entry.propertyId || entry.property?.id || "",
    category: entry.category,
    amount: toCurrencyDigits(entry.amount),
    occurredAt: toDateInputValue(entry.occurredAt),
    description: entry.description ?? "",
    notes: entry.notes ?? "",
  };
};

const parseAmount = (value: string) => {
  const amount = parseCurrencyNumber(value);

  if (amount === null || amount <= 0) {
    return null;
  }

  return amount;
};

export function FinanceEntryForm({
  kind,
  entry,
  isSubmitting,
  submitError,
  onSubmit,
}: TFinanceEntryFormProps) {
  const { t } = useI18n();
  const isEdit = Boolean(entry);
  const [form, setForm] = useState<TFormValues>(() => toFormValues(entry));
  const [errors, setErrors] = useState<TFormErrors>({});
  const listHref = kind === "income" ? INCOMES_ROUTE : EXPENSES_ROUTE;

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
    enabled: !isEdit,
  });
  const categoriesQuery = useQuery({
    queryKey: GET_FINANCE_CATEGORIES_QUERY_KEY,
    queryFn: getFinanceCategories,
  });

  const properties = propertiesQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? FINANCE_CATEGORIES;
  const selectedPropertyId =
    form.propertyId || (!isEdit && properties.length === 1 ? properties[0].id : "");

  const updateField = <K extends keyof TFormValues>(key: K, value: TFormValues[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: TFormErrors = {};

    if (!isEdit && !selectedPropertyId) {
      nextErrors.propertyId = t("FinancePage.form.required");
    }

    if (!form.category) {
      nextErrors.category = t("FinancePage.form.required");
    }

    if (parseAmount(form.amount) === null) {
      nextErrors.amount = t("FinancePage.form.invalidAmount");
    }

    if (!form.occurredAt) {
      nextErrors.occurredAt = t("FinancePage.form.required");
    }

    if (!form.description.trim()) {
      nextErrors.description = t("FinancePage.form.required");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    const amount = parseAmount(form.amount);

    if (amount === null || !form.category) return;

    onSubmit({
      propertyId: selectedPropertyId,
      payload: {
        ...(isEdit ? {} : { propertyId: selectedPropertyId }),
        category: form.category,
        amount,
        occurredAt: form.occurredAt,
        description: form.description.trim(),
        notes: form.notes.trim(),
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {isEdit ? (
          <TextInput
            id="finance-property"
            label={t("FinancePage.form.property")}
            value={entry?.property?.name || ""}
            readOnly
          />
        ) : (
          <Select
            id="finance-property"
            label={t("FinancePage.form.property")}
            value={selectedPropertyId}
            error={errors.propertyId}
            onChange={(event) => {
              updateField("propertyId", event.target.value);
            }}
          >
            <option value="">{t("FinancePage.form.propertyPlaceholder")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
        )}
        <Select
          id="finance-category"
          label={t("FinancePage.form.category")}
          value={form.category}
          error={errors.category}
          onChange={(event) => {
            updateField("category", event.target.value as TFinanceCategory | "");
          }}
        >
          <option value="">{t("FinancePage.form.categoryPlaceholder")}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {t(`FinancePage.category.${category}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput
          id="finance-amount"
          label={t("FinancePage.form.amount")}
          placeholder={t("FinancePage.form.amountPlaceholder")}
          value={form.amount}
          error={errors.amount}
          required
          onValueChange={(value) => updateField("amount", value)}
        />
        <TextInput
          id="finance-occurred-at"
          type="date"
          label={t("FinancePage.form.occurredAt")}
          value={form.occurredAt}
          error={errors.occurredAt}
          required
          onChange={(event) => updateField("occurredAt", event.target.value)}
        />
      </div>

      <TextInput
        id="finance-description"
        label={t("FinancePage.form.description")}
        placeholder={t("FinancePage.form.descriptionPlaceholder")}
        value={form.description}
        error={errors.description}
        maxLength={255}
        required
        onChange={(event) => updateField("description", event.target.value)}
      />

      <TextArea
        id="finance-notes"
        label={t("FinancePage.form.notes")}
        placeholder={t("FinancePage.form.notesPlaceholder")}
        value={form.notes}
        rows={4}
        onChange={(event) => updateField("notes", event.target.value)}
      />

      {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={listHref}
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
