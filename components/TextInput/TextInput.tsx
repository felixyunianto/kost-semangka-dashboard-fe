"use client";

import type { ComponentProps, ReactNode } from "react";
import classNames from "classnames";
import { Icon } from "@iconify/react";

type TTextInputProps = Omit<ComponentProps<"input">, "id" | "value"> & {
  id: string;
  label: string;
  value?: string;
  prefix?: string;
  startIcon?: string;
  endAdornment?: ReactNode;
  error?: string;
};

export function TextInput({
  id,
  label,
  value,
  prefix,
  startIcon,
  endAdornment,
  error,
  className,
  disabled,
  readOnly,
  ...inputProps
}: TTextInputProps) {
  const errorId = error ? `${id}-error` : undefined;
  const isLocked = Boolean(disabled || readOnly);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium text-muted">
            {prefix}
          </span>
        ) : startIcon ? (
          <Icon
            icon={startIcon}
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted"
          />
        ) : null}
        <input
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          {...inputProps}
          {...(value !== undefined ? { value } : {})}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={classNames(
            "h-12 w-full rounded-xl border text-sm outline-none transition placeholder:text-slate-400",
            prefix || startIcon ? "pl-11" : "pl-4",
            endAdornment ? "pr-12" : "pr-4",
            isLocked
              ? "cursor-default border-slate-200 bg-[#f4f7fb] text-muted focus:border-slate-200 focus:ring-0"
              : classNames(
                  "bg-white text-ink focus:ring-4",
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/12"
                    : "border-slate-200 focus:border-primary focus:ring-primary/12",
                ),
            disabled && "cursor-not-allowed",
            className,
          )}
        />
        {endAdornment ? (
          <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
