export const isArray = <Type>(value: unknown): value is Type[] => Array.isArray(value);

export const parseCurrencyDigits = (value: string) => {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
};

export const formatCurrencyInput = (value: string) => {
  const digits = parseCurrencyDigits(value);

  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number(digits));
};

export const toCurrencyDigits = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return "";
  }

  return String(Math.round(amount));
};

export const parseCurrencyNumber = (value: string) => {
  const digits = parseCurrencyDigits(value);

  if (!digits) {
    return null;
  }

  const amount = Number(digits);

  return Number.isFinite(amount) ? amount : null;
};

export const formatCurrency = (value: string | number) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactCurrency = (value: string | number) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatMonth = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const toWhatsAppPhone = (value?: string | null) => {
  if (!value?.trim()) {
    return null;
  }

  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }

  if (digits.length < 10) {
    return null;
  }

  return digits;
};

export const getWhatsAppUrl = (phone?: string | null, text?: string) => {
  const digits = toWhatsAppPhone(phone);

  if (!digits) {
    return null;
  }

  const url = new URL(`https://wa.me/${digits}`);

  if (text?.trim()) {
    url.searchParams.set("text", text.trim());
  }

  return url.toString();
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
};

export const formatLateFee = (
  setting?: {
    lateFeeEnabled: boolean;
    lateFeeType: "FIXED" | "PERCENTAGE";
    lateFeeAmount: string | number;
  } | null,
) => {
  if (!setting?.lateFeeEnabled) {
    return "Off";
  }

  if (setting.lateFeeType === "PERCENTAGE") {
    return `${Number(setting.lateFeeAmount)}%`;
  }

  return formatCurrency(setting.lateFeeAmount);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObject = (object: any, path: string) => {
  return path.split('.').reduce((o, key) => o?.[key], object)
}