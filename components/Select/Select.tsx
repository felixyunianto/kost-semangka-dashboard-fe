"use client";

import type { ComponentProps } from "react";
import classNames from "classnames";
import { Icon } from "@iconify/react";

type TSelectProps = Omit<ComponentProps<"select">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

export function Select({
  id,
  label,
  error,
  className,
  children,
  disabled,
  ...selectProps
}: TSelectProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          {...selectProps}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={classNames(
            "h-12 w-full appearance-none rounded-xl border px-4 pr-12 text-sm outline-none transition",
            disabled
              ? "cursor-not-allowed border-slate-200 bg-[#f4f7fb] text-muted focus:border-slate-200 focus:ring-0"
              : classNames(
                  "bg-white text-ink focus:ring-4",
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/12"
                    : "border-slate-200 focus:border-primary focus:ring-primary/12",
                ),
            className,
          )}
        >
          {children}
        </select>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={classNames(
            "pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2",
            disabled ? "text-slate-400" : "text-muted",
          )}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
