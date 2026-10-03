"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";

import { Sidebar } from "../Sidebar";

type TDashboardShellProps = {
  children: ReactNode;
};

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

export function DashboardShell({ children }: TDashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-[#f4f7fb]/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink"
          >
            <Icon icon="solar:hamburger-menu-linear" className="size-5" />
          </button>
          <p className="font-semibold tracking-tight text-ink">{appName}</p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
