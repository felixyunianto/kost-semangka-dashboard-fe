"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { ConfirmDialog, TextInput } from "@/components";
import { LOGIN_ROUTE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { changePassword, submitLogoutAll } from "@/lib/services";
import { toast, useAuth } from "@/store";

type TPasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type TPasswordErrors = Partial<Record<keyof TPasswordForm, string>>;

const INITIAL_FORM: TPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { logout } = useAuth();
  const [form, setForm] = useState<TPasswordForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<TPasswordErrors>({});
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false);

  const updateField = <K extends keyof TPasswordForm>(key: K, value: TPasswordForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: TPasswordErrors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = t("SettingPage.password.required");
    }

    if (!form.newPassword) {
      nextErrors.newPassword = t("SettingPage.password.required");
    } else if (form.newPassword.length < 8) {
      nextErrors.newPassword = t("SettingPage.password.minLength");
    } else if (form.currentPassword && form.newPassword === form.currentPassword) {
      nextErrors.newPassword = t("SettingPage.password.sameAsCurrent");
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = t("SettingPage.password.required");
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = t("SettingPage.password.mismatch");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const leaveAccount = () => {
    logout();
    router.push(LOGIN_ROUTE);
  };

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success(t("SettingPage.password.success"));
      leaveAccount();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: submitLogoutAll,
    onSuccess: () => {
      toast.success(t("common.toast.signedOut"));
      leaveAccount();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {t("SettingPage.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("SettingPage.subtitle")}
      </p>

      <form
        className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!validate()) return;
          changePasswordMutation.mutate(form);
        }}
      >
        <h2 className="text-base font-semibold text-ink">{t("SettingPage.password.title")}</h2>
        <TextInput
          id="current-password"
          type="password"
          label={t("SettingPage.password.current")}
          value={form.currentPassword}
          error={errors.currentPassword}
          onChange={(event) => updateField("currentPassword", event.target.value)}
        />
        <TextInput
          id="new-password"
          type="password"
          label={t("SettingPage.password.next")}
          value={form.newPassword}
          error={errors.newPassword}
          onChange={(event) => updateField("newPassword", event.target.value)}
        />
        <TextInput
          id="confirm-password"
          type="password"
          label={t("SettingPage.password.confirm")}
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
        />
        {changePasswordMutation.error?.message ? (
          <p className="text-sm text-red-700">{changePasswordMutation.error.message}</p>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon="solar:lock-password-linear" className="size-5" />
            {t("SettingPage.password.save")}
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6">
        <h2 className="text-base font-semibold text-ink">{t("SettingPage.logoutAll.title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("SettingPage.logoutAll.description")}
        </p>
        <button
          type="button"
          onClick={() => {
            logoutAllMutation.reset();
            setIsLogoutAllOpen(true);
          }}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          <Icon icon="solar:logout-2-linear" className="size-5" />
          {t("SettingPage.logoutAll.button")}
        </button>
      </div>

      <ConfirmDialog
        isOpen={isLogoutAllOpen}
        title={t("SettingPage.logoutAll.title")}
        description={t("SettingPage.logoutAll.description")}
        confirmLabel={t("SettingPage.logoutAll.confirm")}
        icon="solar:logout-2-linear"
        tone="danger"
        isProcessing={logoutAllMutation.isPending}
        error={logoutAllMutation.error?.message}
        onCancel={() => {
          if (logoutAllMutation.isPending) return;
          setIsLogoutAllOpen(false);
          logoutAllMutation.reset();
        }}
        onConfirm={() => {
          logoutAllMutation.mutate();
        }}
      />
    </section>
  );
}
