import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TRoom } from "@/lib/entities";

export const getRoom = async (propertyId: string, roomId: string) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}/rooms/${roomId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TRoom> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
