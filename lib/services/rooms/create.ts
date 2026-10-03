import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TCreateRoomPayload, TRoom } from "@/lib/entities";

export const createRoom = async (propertyId: string, payload: TCreateRoomPayload) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}/rooms`);
    const response = await authFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result: TApiResponse<TRoom> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
