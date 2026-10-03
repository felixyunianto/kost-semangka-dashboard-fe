"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Loading } from "./Loading";

type TPopupLoadingProps = {
  open: boolean;
  label?: string;
};

export function PopupLoading({ open, label }: TPopupLoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
      aria-modal="true"
      aria-label={label ?? "Loading"}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div className="relative flex size-[220px] flex-col items-center justify-center rounded-3xl border border-white bg-white p-8 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.28)]">
        <div className="-mt-6">
          <Loading />
        </div>
        {label ? (
          <p className="mt-3 text-sm font-medium text-muted">{label}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
