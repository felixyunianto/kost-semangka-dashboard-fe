import type { TPaginationParam } from "./pagination";

export type TPaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
export type TPaymentGateway = "MIDTRANS";
export type TPaymentChargeStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "FAILED"
  | "SUPERSEDED";

export const PAYMENT_STATUSES: TPaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
];

export const PAYMENT_GATEWAYS: TPaymentGateway[] = ["MIDTRANS"];

export type TPaymentBill = {
  id: string;
  invoiceNumber: string;
  type?: string;
  status?: string;
  amount?: string | number;
  lateFeeAmount?: string | number;
  dueDate?: string | null;
  paidAt?: string | null;
  occupant?: {
    id: string;
    fullName: string;
    email?: string;
    room?: {
      id: string;
      name: string;
      property?: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
};

export type TPaymentCharge = {
  id: string;
  gatewayReference: string;
  amount: string | number;
  status: TPaymentChargeStatus | string;
  expiredAt?: string | null;
  createdAt?: string;
};

export type TPayment = {
  id: string;
  billId: string;
  gateway: TPaymentGateway | string;
  gatewayReference?: string | null;
  amount: string | number;
  status: TPaymentStatus;
  paymentUrl?: string | null;
  payUrl?: string | null;
  qrCode?: string | null;
  expiredAt?: string | null;
  paidAt?: string | null;
  lastChargedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  bill?: TPaymentBill | null;
  charges?: TPaymentCharge[];
};

export type TPaymentListPageFilter = {
  invoiceNumber?: string;
  occupantName?: string;
  propertyId?: string;
  status?: TPaymentStatus | "";
  gateway?: TPaymentGateway | "";
  paidFrom?: string;
  paidTo?: string;
  billId?: string;
};

export type TPaymentParamList = TPaginationParam & TPaymentListPageFilter;
