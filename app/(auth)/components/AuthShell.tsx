"use client";

import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

import { AUTH_HIGHLIGHTS } from "@/lib/constants";

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

type TAuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: TAuthShellProps) {
  const year = new Date().getFullYear();

  return (
    <main className="grid min-h-screen bg-[#f4f7fb] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-primary px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-16 size-80 rounded-full bg-primary-light/35 blur-3xl" />
          <div className="absolute right-[-6rem] bottom-[-4rem] size-[28rem] rounded-full bg-[#0d355f]/70 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 backdrop-blur-sm">
            <Icon icon="solar:home-smile-bold" className="size-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">{appName}</p>
            <p className="text-xs text-white/70">Boarding house dashboard</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-medium tracking-[0.18em] text-white/70 uppercase">
            Welcome
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl">
            Manage your boarding house with calm and clarity.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
            Sign in to review occupancy, payments, and daily operations in one
            clean workspace.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {AUTH_HIGHLIGHTS.map((item) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/12">
                  <Icon icon={item.icon} className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/55">
          © {year} {appName}. All rights reserved.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="animate-login-rise w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
              <Icon icon="solar:home-smile-bold" className="size-5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-ink">{appName}</p>
              <p className="text-xs text-muted">Boarding house dashboard</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.28)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
            </div>
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-muted lg:hidden">
            © {year} {appName}
          </p>
        </div>
      </section>
    </main>
  );
}
