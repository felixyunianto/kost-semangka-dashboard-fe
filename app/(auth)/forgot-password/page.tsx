"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { TextInput } from "@/components/TextInput";
import { LOGIN_ROUTE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  submitForgotPassword,
  submitResendResetOtp,
  submitResetPassword,
  submitVerifyResetOtp,
} from "@/lib/services";
import { toast } from "@/store";

import { AuthShell } from "../components/AuthShell";

type TStep = "email" | "otp" | "password";

type TPasswordForm = {
  password: string;
  confirmPassword: string;
};

type TFieldErrors = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

const isEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<TStep>("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordForm, setPasswordForm] = useState<TPasswordForm>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<TFieldErrors>({});
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resendIn]);

  const startResendCooldown = () => {
    setResendIn(RESEND_COOLDOWN_SECONDS);
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: submitForgotPassword,
    onSuccess: (result) => {
      setChallengeId(result?.challengeId ?? "");
      setOtp("");
      setErrors({});
      setStep("otp");
      startResendCooldown();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: submitVerifyResetOtp,
    onSuccess: () => {
      setPasswordForm({ password: "", confirmPassword: "" });
      setErrors({});
      setStep("password");
    },
    onError: () => {
      setErrors({
        otp: t("ForgotPasswordPage.otpFailed"),
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: submitResendResetOtp,
    onSuccess: () => {
      startResendCooldown();
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: submitResetPassword,
    onSuccess: () => {
      toast.success(t("common.toast.passwordReset"));
      router.replace(LOGIN_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = email.trim();
    const nextErrors: TFieldErrors = {};

    if (!nextEmail) {
      nextErrors.email = t("ForgotPasswordPage.required");
    } else if (!isEmail(nextEmail)) {
      nextErrors.email = t("ForgotPasswordPage.invalidEmail");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    forgotPasswordMutation.mutate({ email: nextEmail });
  };

  const handleOtpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextOtp = otp.trim();

    if (!/^\d{6}$/.test(nextOtp)) {
      setErrors({ otp: t("ForgotPasswordPage.invalidOtp") });
      return;
    }

    if (!challengeId) {
      setErrors({ otp: t("ForgotPasswordPage.otpFailed") });
      return;
    }

    setErrors({});
    verifyOtpMutation.mutate({
      challengeId,
      otp: nextOtp,
    });
  };

  const handleResend = () => {
    if (resendIn > 0 || resendOtpMutation.isPending) return;

    if (!challengeId) {
      toast.error(t("ForgotPasswordPage.otpFailed"));
      return;
    }

    resendOtpMutation.mutate({ challengeId });
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: TFieldErrors = {};

    if (!passwordForm.password) {
      nextErrors.password = t("ForgotPasswordPage.required");
    } else if (passwordForm.password.length < 8) {
      nextErrors.password = t("ForgotPasswordPage.minLength");
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = t("ForgotPasswordPage.required");
    } else if (passwordForm.password !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = t("ForgotPasswordPage.mismatch");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    resetPasswordMutation.mutate({
      password: passwordForm.password,
      confirmPassword: passwordForm.confirmPassword,
    });
  };

  const title =
    step === "email"
      ? t("ForgotPasswordPage.emailTitle")
      : step === "otp"
        ? t("ForgotPasswordPage.otpTitle")
        : t("ForgotPasswordPage.passwordTitle");

  const subtitle =
    step === "email"
      ? t("ForgotPasswordPage.emailSubtitle")
      : step === "otp"
        ? t("ForgotPasswordPage.otpSubtitle", { email })
        : t("ForgotPasswordPage.passwordSubtitle");

  const isSubmitting =
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  return (
    <AuthShell title={title} subtitle={subtitle}>
      {step === "email" ? (
        <form className="flex flex-col gap-5" onSubmit={handleEmailSubmit}>
          <TextInput
            id="forgot-email"
            name="email"
            type="email"
            label={t("ForgotPasswordPage.email")}
            value={email}
            error={errors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            startIcon="solar:letter-linear"
            autoComplete="email"
            required
            placeholder={t("ForgotPasswordPage.emailPlaceholder")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(27,79,138,0.55)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("ForgotPasswordPage.sendCode")}
            <Icon icon="solar:arrow-right-linear" className="size-5" />
          </button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form className="flex flex-col gap-5" onSubmit={handleOtpSubmit}>
          <TextInput
            id="forgot-otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            label={t("ForgotPasswordPage.otp")}
            value={otp}
            error={errors.otp}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(nextValue);
              setErrors((current) => ({ ...current, otp: undefined }));
            }}
            startIcon="solar:shield-keyhole-linear"
            required
            placeholder={t("ForgotPasswordPage.otpPlaceholder")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(27,79,138,0.55)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("ForgotPasswordPage.verify")}
            <Icon icon="solar:arrow-right-linear" className="size-5" />
          </button>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={resendIn > 0 || resendOtpMutation.isPending}
              onClick={handleResend}
              className="text-sm font-medium text-primary transition hover:text-primary-hover disabled:cursor-not-allowed disabled:text-muted"
            >
              {resendIn > 0
                ? t("ForgotPasswordPage.resendIn", { seconds: resendIn })
                : t("ForgotPasswordPage.resend")}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setErrors({});
              }}
              className="text-sm font-medium text-muted transition hover:text-ink"
            >
              {t("ForgotPasswordPage.changeEmail")}
            </button>
          </div>
        </form>
      ) : null}

      {step === "password" ? (
        <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
          <TextInput
            id="forgot-password"
            name="password"
            type={showPassword ? "text" : "password"}
            label={t("ForgotPasswordPage.password")}
            value={passwordForm.password}
            error={errors.password}
            onChange={(event) => {
              setPasswordForm((current) => ({
                ...current,
                password: event.target.value,
              }));
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            startIcon="solar:lock-keyhole-linear"
            autoComplete="new-password"
            required
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary"
              >
                <Icon
                  icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"}
                  className="size-5"
                />
              </button>
            }
          />
          <TextInput
            id="forgot-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            label={t("ForgotPasswordPage.confirmPassword")}
            value={passwordForm.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => {
              setPasswordForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }));
              setErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            startIcon="solar:lock-keyhole-linear"
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(27,79,138,0.55)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("ForgotPasswordPage.reset")}
            <Icon icon="solar:arrow-right-linear" className="size-5" />
          </button>
        </form>
      ) : null}

      <Link
        href={LOGIN_ROUTE}
        className="mt-5 inline-flex w-full items-center justify-center text-sm font-medium text-muted transition hover:text-primary"
      >
        {t("ForgotPasswordPage.backToSignIn")}
      </Link>
    </AuthShell>
  );
}
