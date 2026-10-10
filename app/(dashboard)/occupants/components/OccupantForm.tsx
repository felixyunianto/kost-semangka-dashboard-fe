"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Select, TextInput } from "@/components";
import {
  GET_PROPERTY_LIST_QUERY_KEY,
  GET_ROOM_LIST_QUERY_KEY,
  OCCUPANTS_ROUTE,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getProperties, getRooms, sendPreviewTestEmail } from "@/lib/services";

import type { TOccupant, TOccupantFormSubmit } from "@/lib/entities";

type TOccupantFormProps = {
  occupant?: TOccupant;
  propertyId?: string;
  propertyName?: string;
  roomName?: string;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (data: TOccupantFormSubmit) => void;
};

const INITIAL_FORM = {
  propertyId: "",
  roomId: "",
  fullName: "",
  email: "",
  phone: "",
  checkIn: "",
  checkOut: "",
};

type TFormValues = typeof INITIAL_FORM;
type TFormErrors = Partial<Record<keyof TFormValues, string>>;

const isEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const toFormValues = (
  occupant?: TOccupant,
  propertyId?: string,
): TFormValues => {
  if (!occupant) {
    return INITIAL_FORM;
  }

  return {
    propertyId: propertyId ?? occupant.room?.property?.id ?? "",
    roomId: occupant.roomId,
    fullName: occupant.fullName,
    email: occupant.email,
    phone: occupant.phone ?? "",
    checkIn: toDateInputValue(occupant.checkIn),
    checkOut: toDateInputValue(occupant.checkOut),
  };
};

export function OccupantForm({
  occupant,
  propertyId,
  propertyName,
  roomName,
  isSubmitting,
  submitError,
  onSubmit,
}: TOccupantFormProps) {
  const { t } = useI18n();
  const isEdit = Boolean(occupant);
  const [form, setForm] = useState<TFormValues>(() =>
    toFormValues(occupant, propertyId),
  );
  const [errors, setErrors] = useState<TFormErrors>({});
  const [testedEmail, setTestedEmail] = useState("");

  const propertiesQuery = useQuery({
    queryKey: [...GET_PROPERTY_LIST_QUERY_KEY, { page: 1, limit: 100 }],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
    enabled: !isEdit,
  });

  const roomsQuery = useQuery({
    queryKey: [
      ...GET_ROOM_LIST_QUERY_KEY,
      form.propertyId,
      { status: "available" },
    ],
    queryFn: () =>
      getRooms(form.propertyId, {
        status: "available",
      }),
    enabled: !isEdit && Boolean(form.propertyId),
  });

  const properties = propertiesQuery.data?.items ?? [];
  const rooms = roomsQuery.data ?? [];

  useEffect(() => {
    if (occupant) {
      setForm(toFormValues(occupant, propertyId));
    }
  }, [occupant, propertyId]);

  useEffect(() => {
    if (isEdit || form.propertyId || properties.length !== 1) {
      return;
    }

    setForm((current) => ({
      ...current,
      propertyId: properties[0].id,
    }));
  }, [form.propertyId, isEdit, properties]);

  const updateField = <K extends keyof TFormValues>(
    key: K,
    value: TFormValues[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "propertyId" ? { roomId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (key === "email") {
      setTestedEmail("");
    }
  };

  const testEmailMutation = useMutation({
    mutationFn: sendPreviewTestEmail,
    onSuccess: (result) => {
      setErrors((current) => ({ ...current, email: undefined }));
      setTestedEmail(result?.email || form.email.trim());
    },
    onError: (error) => {
      setTestedEmail("");
      setErrors((current) => ({
        ...current,
        email: error.message || t("OccupantPage.form.testEmailFailed"),
      }));
    },
  });

  const handleTestEmail = () => {
    const email = form.email.trim();
    const propertyName =
      properties?.find((property) => property.id === form?.propertyId)?.name ||
      "";

    if (!email) {
      setTestedEmail("");
      setErrors((current) => ({
        ...current,
        email: t("OccupantPage.form.required"),
      }));
      return;
    }

    if (!isEmail(email)) {
      setTestedEmail("");
      setErrors((current) => ({
        ...current,
        email: t("OccupantPage.form.invalidEmail"),
      }));
      return;
    }

    setErrors((current) => ({ ...current, email: undefined }));
    testEmailMutation.mutate({
      email,
      ...(form.fullName.trim() ? { fullName: form.fullName.trim() } : {}),
      ...(propertyName?.trim() ? { propertyName: propertyName?.trim() } : {}),
    });
  };

  const validate = () => {
    const nextErrors: TFormErrors = {};

    if (!isEdit && !form.propertyId) {
      nextErrors.propertyId = t("OccupantPage.form.required");
    }

    if (!isEdit && !form.roomId) {
      nextErrors.roomId = t("OccupantPage.form.required");
    }

    if (!form.fullName.trim()) {
      nextErrors.fullName = t("OccupantPage.form.required");
    }

    if (!form.email.trim()) {
      nextErrors.email = t("OccupantPage.form.required");
    } else if (!isEmail(form.email.trim())) {
      nextErrors.email = t("OccupantPage.form.invalidEmail");
    }

    if (!form.checkIn) {
      nextErrors.checkIn = t("OccupantPage.form.required");
    }

    if (
      isEdit &&
      form.checkOut &&
      form.checkIn &&
      form.checkOut < form.checkIn
    ) {
      nextErrors.checkOut = t("OccupantPage.form.checkOutBeforeCheckIn");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      propertyId: form.propertyId,
      roomId: form.roomId,
      payload: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        checkIn: form.checkIn,
        ...(isEdit && form.checkOut && { checkOut: form.checkOut }),
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
      onSubmit={handleSubmit}
    >
      {isEdit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="occupant-property"
            label={t("OccupantPage.form.property")}
            value={propertyName || occupant?.room?.property?.name || ""}
            readOnly
          />
          <TextInput
            id="occupant-room"
            label={t("OccupantPage.form.room")}
            value={roomName || occupant?.room?.name || ""}
            readOnly
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="occupant-property"
            label={t("OccupantPage.form.property")}
            value={form.propertyId}
            error={errors.propertyId}
            onChange={(event) => {
              updateField("propertyId", event.target.value);
            }}
          >
            <option value="">
              {t("OccupantPage.form.propertyPlaceholder")}
            </option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <div className="flex flex-col gap-2">
            <Select
              id="occupant-room"
              label={t("OccupantPage.form.room")}
              value={form.roomId}
              disabled={!form.propertyId || roomsQuery.isLoading}
              error={errors.roomId}
              onChange={(event) => {
                updateField("roomId", event.target.value);
              }}
            >
              <option value="">{t("OccupantPage.form.roomPlaceholder")}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            {form.propertyId && !roomsQuery.isLoading && rooms.length === 0 ? (
              <p className="text-sm text-muted">
                {t("OccupantPage.form.noRooms")}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="occupant-full-name"
          label={t("OccupantPage.form.fullName")}
          placeholder={t("OccupantPage.form.fullNamePlaceholder")}
          value={form.fullName}
          error={errors.fullName}
          maxLength={150}
          required
          onChange={(event) => updateField("fullName", event.target.value)}
        />
        <div>
          <TextInput
            id="occupant-email"
            type="email"
            label={t("OccupantPage.form.email")}
            placeholder={t("OccupantPage.form.emailPlaceholder")}
            value={form.email}
            error={errors.email}
            required
            className="pr-20"
            onChange={(event) => updateField("email", event.target.value)}
            endAdornment={
              <button
                type="button"
                disabled={testEmailMutation.isPending}
                onClick={handleTestEmail}
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("OccupantPage.form.testEmail")}
              </button>
            }
          />
          {testedEmail && testedEmail === form.email.trim() && !errors.email ? (
            <p className="mt-2 text-sm text-primary">
              {t("OccupantPage.form.testEmailSent")}
            </p>
          ) : null}
        </div>
      </div>

      <TextInput
        id="occupant-phone"
        label={t("OccupantPage.form.phone")}
        placeholder={t("OccupantPage.form.phonePlaceholder")}
        value={form.phone}
        error={errors.phone}
        maxLength={30}
        onChange={(event) => updateField("phone", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="occupant-check-in"
          type="date"
          label={t("OccupantPage.form.checkIn")}
          value={form.checkIn}
          error={errors.checkIn}
          required
          onChange={(event) => updateField("checkIn", event.target.value)}
        />
        {isEdit ? (
          <TextInput
            id="occupant-check-out"
            type="date"
            label={t("OccupantPage.form.checkOut")}
            value={form.checkOut}
            error={errors.checkOut}
            onChange={(event) => updateField("checkOut", event.target.value)}
          />
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-red-700">{submitError}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={OCCUPANTS_ROUTE}
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
