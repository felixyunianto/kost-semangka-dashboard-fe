import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TCreateOccupantPayload, TOccupant } from "@/lib/entities";

export const createOccupant = async (
  propertyId: string,
  roomId: string,
  payload: TCreateOccupantPayload,
) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}/rooms/${roomId}/occupants`);
    const response = await authFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result: TApiResponse<TOccupant> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
