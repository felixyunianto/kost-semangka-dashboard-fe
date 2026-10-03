import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TOccupant, TOccupantParamList, TPaginated } from "@/lib/entities";

const toOccupantQuery = (filter: TOccupantParamList) => {
  return {
    page: filter.page,
    limit: filter.limit,
    ...(filter.name?.trim() && { name: filter.name.trim() }),
    ...(filter.propertyId?.trim() && { propertyId: filter.propertyId.trim() }),
    ...(filter.isActive === "true" || filter.isActive === "false"
      ? { isActive: filter.isActive === "true" }
      : {}),
    ...(filter.checkInFrom?.trim() && { checkInFrom: filter.checkInFrom.trim() }),
    ...(filter.checkInTo?.trim() && { checkInTo: filter.checkInTo.trim() }),
  };
};

export const getOccupants = async (filter: TOccupantParamList) => {
  try {
    const url = getAPIEndpoint("/occupants", toOccupantQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TOccupant>> = await processResult(response);

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
