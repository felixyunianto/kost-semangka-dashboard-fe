import type { TBill, TBillStatus } from "./bill";
import type { TPaginationParam } from "./pagination";

export type TPropertyOccupant = {
  id: string;
  fullName: string;
};

export type TRentalType = "MONTHLY" | "DAILY";

export type TInventoryCondition = "GOOD" | "FAIR" | "POOR";
export type TInventoryStatus = "FUNCTIONAL" | "REPAIRING";

export const INVENTORY_CONDITIONS: TInventoryCondition[] = ["GOOD", "FAIR", "POOR"];
export const INVENTORY_STATUSES: TInventoryStatus[] = ["FUNCTIONAL", "REPAIRING"];

export type TRoomInventory = {
  id?: string;
  name: string;
  condition: TInventoryCondition;
  status: TInventoryStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type TRoomInventoryPayload = {
  name: string;
  condition: TInventoryCondition;
  status?: TInventoryStatus;
};

export type TRoom = {
  id: string;
  propertyId: string;
  name: string;
  description?: string | null;
  price: string | number;
  rentalType: TRentalType;
  isAvailable: boolean;
  type?: string | null;
  length?: string | number | null;
  width?: string | number | null;
  inventories?: TRoomInventory[];
  occupant: TPropertyOccupant | null;
  occupantName: string | null;
  // null = kamar kosong / belum ada tagihan sewa
  rentStatus?: Exclude<TBillStatus, "CANCELLED"> | null;
  // Tagihan sewa belum lunas, urut dari jatuh tempo paling lama
  outstandingRentBills?: TRoomRentBill[];
};

export type TRoomRentBill = Pick<
  TBill,
  | "id"
  | "invoiceNumber"
  | "type"
  | "amount"
  | "lateFeeAmount"
  | "status"
  | "periodStart"
  | "periodEnd"
  | "dueDate"
>;

export type TPropertyRoom = TRoom;

export type TLateFeeType = "FIXED" | "PERCENTAGE";

export type TCreatePropertyPayload = {
  name: string;
  description: string;
  address: string;
  phone?: string;
  lateFeeEnabled?: boolean;
  lateFeeType?: TLateFeeType;
  lateFeeAmount?: number;
  lateFeeGraceDays?: number;
};

export type TUpdatePropertyPayload = TCreatePropertyPayload;

export type TPropertySetting = {
  lateFeeEnabled: boolean;
  lateFeeType: TLateFeeType;
  lateFeeAmount: string | number;
  lateFeeGraceDays: number;
};

export type TProperty = {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  address: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  rooms: TPropertyRoom[];
  setting?: TPropertySetting | null;
};

export type TPropertyListPageFilter = {
  name?: string;
  lateFee?: string;
}

export type TPropertyParamList = TPaginationParam & TPropertyListPageFilter

export type TRoomStatusFilter = "available" | "occupied";

export type TRoomListPageFilter = {
  occupantName?: string;
  name?: string;
  status?: TRoomStatusFilter | "";
  minPrice?: string;
  maxPrice?: string;
  minLength?: string;
  maxLength?: string;
  minWidth?: string;
  maxWidth?: string;
  inventories?: string;
  inventoryStatus?: TInventoryStatus | "";
  inventoryCondition?: TInventoryCondition | "";
}

export type TRoomParamList = TPaginationParam & TRoomListPageFilter

export type TCreateRoomPayload = {
  name: string;
  price: number;
  description?: string;
  type?: string;
  length?: number;
  width?: number;
  inventories?: TRoomInventoryPayload[];
};

export type TUpdateRoomPayload = TCreateRoomPayload;
