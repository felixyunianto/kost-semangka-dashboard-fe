import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TRoom, TUpdateRoomPayload } from "@/lib/entities";

export const updateRoom = async (
  propertyId: string,
  roomId: string,
  payload: TUpdateRoomPayload,
) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}/rooms/${roomId}`);
    const response = await authFetch(url, {
      method: "PATCH",
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
