"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import { useToastStore } from "@/store/toast";

const TOAST_DURATION_MS = 4200;

export function ToastViewport() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4 sm:inset-x-auto sm:right-4 sm:justify-end">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <ToastItem
            key={item.id}
            id={item.id}
            tone={item.tone}
            message={item.message}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </div>
  );
}

function ToastItem({
  id,
  tone,
  message,
  onDismiss,
}: {
  id: string;
  tone: "success" | "error";
  message: string;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDismiss(id);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [id, onDismiss]);

  const isSuccess = tone === "success";

  return (
    <div
      role="status"
      className={classNames(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.28)]",
        isSuccess
          ? "border-emerald-100 bg-white text-ink"
          : "border-red-100 bg-white text-ink",
      )}
    >
      <div
        className={classNames(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
        )}
      >
        <Icon
          icon={isSuccess ? "solar:check-circle-linear" : "solar:danger-triangle-linear"}
          className="size-5"
        />
      </div>
      <p className="flex-1 pt-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(id)}
        className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-slate-50 hover:text-ink"
      >
        <Icon icon="solar:close-circle-linear" className="size-4" />
      </button>
    </div>
  );
}
