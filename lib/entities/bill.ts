import type { TPaginationParam } from "./pagination";

export type TBillType = "RENT" | "MANUAL" | "BOOKING";
export type TBillStatus = "UNPAID" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export type TBillOccupant = {
  id: string;
  fullName: string;
  email?: string;
  isActive?: boolean;
  room?: {
    id: string;
    name: string;
    property?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export type TBillPayment = {
  id: string;
  status: string;
  amount?: string | number;
  paymentUrl?: string | null;
  qrCode?: string | null;
  expiredAt?: string | null;
  paidAt?: string | null;
  gatewayReference?: string | null;
} | null;

export type TBill = {
  id: string;
  occupantId?: string | null;
  invoiceNumber: string;
  type: TBillType;
  amount: string | number;
  lateFeeAmount: string | number;
  payableAmount?: string | number;
  periodStart?: string | null;
  periodEnd?: string | null;
  dueDate?: string | null;
  description?: string | null;
  status: TBillStatus;
  paidAt?: string | null;
  createdAt?: string;
  occupant?: TBillOccupant | null;
  payment?: TBillPayment;
};

export type TBillListPageFilter = {
  invoiceNumber?: string;
  occupantName?: string;
  propertyId?: string;
  status?: TBillStatus | "";
  type?: TBillType | "";
  dueDateFrom?: string;
  dueDateTo?: string;
};

export type TBillParamList = TPaginationParam & TBillListPageFilter;

export type TCreateBillPayload = {
  occupantId: string;
  amount: number;
  dueDate: string;
  description: string;
};

export type TUpdateBillPayload = {
  amount?: number;
  dueDate?: string;
  description?: string;
};

export type TBillFormSubmit = {
  occupantId: string;
  payload: TCreateBillPayload | TUpdateBillPayload;
};

export type TProcessOverdueResult = {
  message?: string;
  markedOverdue: number;
  lateFeesApplied: number;
};

export type TGenerateMissingResult = {
  message?: string;
  created: number;
};

export type TSendRemindersResult = {
  message?: string;
  sent: number;
  skipped: number;
  failed: number;
};

export const canEditManualBill = (bill: TBill) => {
  return (
    bill.type === "MANUAL" &&
    bill.status !== "PAID" &&
    bill.status !== "CANCELLED" &&
    bill.payment?.status !== "PENDING"
  );
};

export const canCancelBill = (bill: TBill) => {
  return (
    bill.status !== "PAID" &&
    bill.status !== "CANCELLED" &&
    bill.payment?.status !== "PENDING"
  );
};

export const canMarkPaidCash = (bill: TBill) => {
  return bill.status !== "PAID" && bill.status !== "CANCELLED";
};
