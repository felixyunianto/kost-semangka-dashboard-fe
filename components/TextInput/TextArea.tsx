"use client";

import type { ComponentProps } from "react";
import classNames from "classnames";

type TTextAreaProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

export function TextArea({
  id,
  label,
  error,
  className,
  disabled,
  readOnly,
  ...textAreaProps
}: TTextAreaProps) {
  const errorId = error ? `${id}-error` : undefined;
  const isLocked = Boolean(disabled || readOnly);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        disabled={disabled}
        readOnly={readOnly}
        {...textAreaProps}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={classNames(
          "min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400",
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
      {error ? (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
