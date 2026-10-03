"use client";

import { TextInput } from "../TextInput";
import { formatCurrencyInput, parseCurrencyDigits } from "@/lib/helpers";

type TCurrencyInputProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

export function CurrencyInput({
  id,
  label,
  value,
  onValueChange,
  error,
  placeholder = "0",
  required,
  disabled,
  readOnly,
}: TCurrencyInputProps) {
  return (
    <TextInput
      id={id}
      label={label}
      value={formatCurrencyInput(value)}
      error={error}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      inputMode="numeric"
      autoComplete="off"
      prefix="Rp"
      onChange={(event) => {
        onValueChange(parseCurrencyDigits(event.target.value));
      }}
    />
  );
}
