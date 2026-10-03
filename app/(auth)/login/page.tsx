"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { TextInput } from "@/components/TextInput";
import { FORGOT_PASSWORD_ROUTE } from "@/lib/constants";
import { useLogin } from "@/lib/hooks";

import { AuthShell } from "../components/AuthShell";

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

export default function LoginPage() {
  const { state, events } = useLogin();

  const { email, password, showPassword, isSubmitting } = state;
  const { handleEmailChange, handlePasswordChange, handleShowPassword, handleSubmit } = events;

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle={`Use your admin credentials to access the ${appName} dashboard.`}
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextInput
          id="email"
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={handleEmailChange}
          startIcon="solar:letter-linear"
          autoComplete="email"
          required
          placeholder="name@kostsemangka.com"
        />

        <TextInput
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          startIcon="solar:lock-keyhole-linear"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          endAdornment={
            <button
              type="button"
              onClick={handleShowPassword}
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

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-slate-300 text-primary accent-primary"
            />
            Remember me
          </label>
          <Link
            href={FORGOT_PASSWORD_ROUTE}
            className="text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(27,79,138,0.55)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          Sign in
          <Icon icon="solar:arrow-right-linear" className="size-5" />
        </button>
      </form>
    </AuthShell>
  );
}
