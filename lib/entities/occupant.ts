import type { TPaginationParam } from "./pagination";

export type TOccupantProperty = {
  id: string;
  name: string;
};

export type TOccupantRoom = {
  id: string;
  name: string;
  property?: TOccupantProperty | null;
};

export type TOccupant = {
  id: string;
  roomId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  checkIn: string;
  checkOut?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  room?: TOccupantRoom | null;
};

export type TOccupantActiveFilter = "true" | "false";

export type TOccupantListPageFilter = {
  name?: string;
  propertyId?: string;
  isActive?: TOccupantActiveFilter | "";
  checkInFrom?: string;
  checkInTo?: string;
};

export type TOccupantParamList = TPaginationParam & TOccupantListPageFilter;

export type TCreateOccupantPayload = {
  fullName: string;
  email: string;
  phone?: string;
  checkIn: string;
};

export type TUpdateOccupantPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
};

export type TCheckoutOccupantPayload = {
  checkOut?: string;
};

export type TOccupantFormSubmit = {
  propertyId: string;
  roomId: string;
  payload: TCreateOccupantPayload & { checkOut?: string };
};

export type TTestOccupantEmailPayload = {
  email: string;
  fullName?: string;
  propertyName?: string;
};

export type TTestEmailResult = {
  message: string;
  email: string;
  deliveredTo?: string;
};
