import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TPaginated, TRoom, TRoomParamList } from "@/lib/entities";

const toOptionalNumber = (value?: string) => {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const toRoomQuery = (filter: TRoomParamList) => {
  const minPrice = toOptionalNumber(filter.minPrice);
  const maxPrice = toOptionalNumber(filter.maxPrice);
  const minLength = toOptionalNumber(filter.minLength);
  const maxLength = toOptionalNumber(filter.maxLength);
  const minWidth = toOptionalNumber(filter.minWidth);
  const maxWidth = toOptionalNumber(filter.maxWidth);

  return {
    page: filter.page,
    limit: filter.limit,
    ...(filter.occupantName?.trim() && { occupantName: filter.occupantName.trim() }),
    ...(filter.name?.trim() && { name: filter.name.trim() }),
    ...(filter.status === "available" || filter.status === "occupied"
      ? { isAvailable: filter.status === "available" }
      : {}),
    ...(minPrice !== undefined && { minPrice }),
    ...(maxPrice !== undefined && { maxPrice }),
    ...(minLength !== undefined && { minLength }),
    ...(maxLength !== undefined && { maxLength }),
    ...(minWidth !== undefined && { minWidth }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(filter.inventories?.trim() && { inventories: filter.inventories.trim() }),
    ...(filter.inventoryStatus && { inventoryStatus: filter.inventoryStatus }),
    ...(filter.inventoryCondition && { inventoryCondition: filter.inventoryCondition }),
  };
};

export const getRooms = async (propertyId: string, filter: TRoomParamList) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}/rooms`, toRoomQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TRoom>> = await processResult(response);

    const isSuccess =
      result.code === "SUCCESS" &&
      result.data &&
      Array.isArray(result.data.items) &&
      Boolean(result.data.pagination);

    if (isSuccess) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
