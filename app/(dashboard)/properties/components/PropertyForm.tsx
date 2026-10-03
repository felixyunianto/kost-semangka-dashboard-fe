"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { CurrencyInput, Select, TextArea, TextInput } from "@/components";
import { PROPERTIES_ROUTE } from "@/lib/constants";
import { parseCurrencyNumber, toCurrencyDigits } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TCreatePropertyPayload, TLateFeeType, TProperty } from "@/lib/entities";

type TPropertyFormProps = {
  property?: TProperty;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (payload: TCreatePropertyPayload) => void;
};

const INITIAL_FORM = {
  name: "",
  description: "",
  address: "",
  phone: "",
  lateFeeEnabled: false,
  lateFeeType: "FIXED" as TLateFeeType,
  lateFeeAmount: "",
  lateFeeGraceDays: "",
};

type TFormValues = typeof INITIAL_FORM;
type TFormErrors = Partial<Record<keyof TFormValues, string>>;

const toFormValues = (property?: TProperty): TFormValues => {
  if (!property) {
    return INITIAL_FORM;
  }

  return {
    name: property.name,
    description: property.description ?? "",
    address: property.address,
    phone: property.phone ?? "",
    lateFeeEnabled: property.setting?.lateFeeEnabled ?? false,
    lateFeeType: property.setting?.lateFeeType ?? "FIXED",
    lateFeeAmount:
      property.setting?.lateFeeAmount !== undefined
        ? property.setting.lateFeeType === "PERCENTAGE"
          ? String(property.setting.lateFeeAmount)
          : toCurrencyDigits(property.setting.lateFeeAmount)
        : "",
    lateFeeGraceDays:
      property.setting?.lateFeeGraceDays !== undefined
        ? String(property.setting.lateFeeGraceDays)
        : "",
  };
};

const toPayload = (form: TFormValues): TCreatePropertyPayload => {
  const lateFeeAmount =
    form.lateFeeType === "PERCENTAGE"
      ? Number(form.lateFeeAmount)
      : (parseCurrencyNumber(form.lateFeeAmount) ?? Number(form.lateFeeAmount));
  const lateFeeGraceDays = Number(form.lateFeeGraceDays);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    address: form.address.trim(),
    ...(form.phone.trim() && { phone: form.phone.trim() }),
    lateFeeEnabled: form.lateFeeEnabled,
    lateFeeType: form.lateFeeEnabled ? form.lateFeeType : "FIXED",
    lateFeeAmount:
      form.lateFeeEnabled && Number.isFinite(lateFeeAmount) ? lateFeeAmount : 0,
    lateFeeGraceDays:
      form.lateFeeEnabled && Number.isFinite(lateFeeGraceDays)
        ? lateFeeGraceDays
        : 0,
  };
};

export function PropertyForm({
  property,
  isSubmitting,
  submitError,
  onSubmit,
}: TPropertyFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<TFormValues>(() => toFormValues(property));
  const [errors, setErrors] = useState<TFormErrors>({});
  const isEdit = Boolean(property);

  useEffect(() => {
    if (property) {
      setForm(toFormValues(property));
    }
  }, [property]);

  const updateField = <K extends keyof TFormValues>(
    key: K,
    value: TFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: TFormErrors = {};

    if (!form.name.trim()) nextErrors.name = t("PropertyPage.form.required");
    if (!form.description.trim()) {
      nextErrors.description = t("PropertyPage.form.required");
    }
    if (!form.address.trim()) nextErrors.address = t("PropertyPage.form.required");

    if (form.lateFeeEnabled && form.lateFeeType === "PERCENTAGE") {
      const amount = Number(form.lateFeeAmount);

      if (Number.isFinite(amount) && amount > 100) {
        nextErrors.lateFeeAmount = t("PropertyPage.form.percentageMax");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit(toPayload(form));
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="property-name"
          label={t("PropertyPage.form.name")}
          placeholder={t("PropertyPage.form.namePlaceholder")}
          value={form.name}
          error={errors.name}
          required
          onChange={(event) => updateField("name", event.target.value)}
        />
        <TextInput
          id="property-phone"
          label={t("PropertyPage.form.phone")}
          placeholder={t("PropertyPage.form.phonePlaceholder")}
          value={form.phone}
          error={errors.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </div>

      <TextArea
        id="property-description"
        label={t("PropertyPage.form.description")}
        placeholder={t("PropertyPage.form.descriptionPlaceholder")}
        value={form.description}
        error={errors.description}
        required
        onChange={(event) => updateField("description", event.target.value)}
      />

      <TextInput
        id="property-address"
        label={t("PropertyPage.form.address")}
        placeholder={t("PropertyPage.form.addressPlaceholder")}
        value={form.address}
        error={errors.address}
        required
        onChange={(event) => updateField("address", event.target.value)}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-[#f4f7fb] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">
              {t("PropertyPage.form.lateFee")}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t("PropertyPage.form.lateFeeHelper")}
            </p>
          </div>
          <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => updateField("lateFeeEnabled", false)}
              className={classNames(
                "h-9 rounded-lg px-3 text-sm font-medium transition",
                form.lateFeeEnabled
                  ? "text-muted hover:text-ink"
                  : "bg-primary text-white",
              )}
            >
              {t("PropertyPage.form.lateFeeOff")}
            </button>
            <button
              type="button"
              onClick={() => updateField("lateFeeEnabled", true)}
              className={classNames(
                "h-9 rounded-lg px-3 text-sm font-medium transition",
                form.lateFeeEnabled
                  ? "bg-primary text-white"
                  : "text-muted hover:text-ink",
              )}
            >
              {t("PropertyPage.form.lateFeeOn")}
            </button>
          </div>
        </div>

        {form.lateFeeEnabled ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              id="property-late-fee-type"
              label={t("PropertyPage.form.lateFeeType")}
              value={form.lateFeeType}
              onChange={(event) => {
                updateField("lateFeeType", event.target.value as TLateFeeType);
              }}
            >
              <option value="FIXED">{t("PropertyPage.form.lateFeeFixed")}</option>
              <option value="PERCENTAGE">
                {t("PropertyPage.form.lateFeePercentage")}
              </option>
            </Select>
            {form.lateFeeType === "PERCENTAGE" ? (
              <TextInput
                id="property-late-fee-amount"
                type="number"
                min="0"
                step="0.01"
                label={t("PropertyPage.form.lateFeeAmount")}
                placeholder="5"
                value={form.lateFeeAmount}
                error={errors.lateFeeAmount}
                onChange={(event) => updateField("lateFeeAmount", event.target.value)}
              />
            ) : (
              <CurrencyInput
                id="property-late-fee-amount"
                label={t("PropertyPage.form.lateFeeAmount")}
                placeholder="50.000"
                value={form.lateFeeAmount}
                error={errors.lateFeeAmount}
                onValueChange={(value) => updateField("lateFeeAmount", value)}
              />
            )}
            <TextInput
              id="property-late-fee-grace-days"
              type="number"
              min="0"
              step="1"
              label={t("PropertyPage.form.lateFeeGraceDays")}
              placeholder="3"
              value={form.lateFeeGraceDays}
              error={errors.lateFeeGraceDays}
              onChange={(event) => updateField("lateFeeGraceDays", event.target.value)}
            />
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-red-700">{submitError}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={PROPERTIES_ROUTE}
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
