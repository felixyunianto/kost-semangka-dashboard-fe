"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog, TextInput } from "@/components";
import { toDateInputValue } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";

import type { TOccupant } from "@/lib/entities";

type TOccupantCheckoutDialogProps = {
  occupant: TOccupant | null;
  isCheckingOut?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (checkOut: string) => void;
};

const OccupantCheckoutDialog = ({
  occupant,
  isCheckingOut,
  error,
  onCancel,
  onConfirm,
}: TOccupantCheckoutDialogProps) => {
  const { t } = useI18n();
  const [checkOut, setCheckOut] = useState(toDateInputValue(new Date().toISOString()));
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (occupant) {
      setCheckOut(toDateInputValue(new Date().toISOString()));
      setDateError("");
    }
  }, [occupant]);

  return (
    <ConfirmDialog
      isOpen={Boolean(occupant)}
      title={t("OccupantPage.table.checkoutTitle")}
      description={t("OccupantPage.table.checkoutDescription", {
        name: occupant?.fullName ?? "",
      })}
      confirmLabel={t("OccupantPage.table.checkoutConfirm")}
      icon="solar:logout-2-linear"
      tone="warning"
      isProcessing={isCheckingOut}
      error={error || dateError}
      onCancel={onCancel}
      onConfirm={() => {
        if (!occupant) return;

        if (!checkOut) {
          setDateError(t("OccupantPage.form.required"));
          return;
        }

        if (occupant.checkIn && checkOut < toDateInputValue(occupant.checkIn)) {
          setDateError(t("OccupantPage.form.checkOutBeforeCheckIn"));
          return;
        }

        onConfirm(checkOut);
      }}
    >
      <div className="mt-4">
        <TextInput
          id="occupant-checkout-date"
          type="date"
          label={t("OccupantPage.form.checkOut")}
          value={checkOut}
          onChange={(event) => {
            setCheckOut(event.target.value);
            setDateError("");
          }}
        />
      </div>
    </ConfirmDialog>
  );
};

export default OccupantCheckoutDialog;
