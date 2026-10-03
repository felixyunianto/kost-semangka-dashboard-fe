import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TOccupant, TUpdateOccupantPayload } from "@/lib/entities";

export const updateOccupant = async (
  propertyId: string,
  roomId: string,
  occupantId: string,
  payload: TUpdateOccupantPayload,
) => {
  try {
    const url = getAPIEndpoint(
      `/properties/${propertyId}/rooms/${roomId}/occupants/${occupantId}`,
    );
    const response = await authFetch(url, {
      method: "PATCH",
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
