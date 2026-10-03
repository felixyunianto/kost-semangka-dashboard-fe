import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse } from "@/lib/entities";

export const deleteOccupant = async (
  propertyId: string,
  roomId: string,
  occupantId: string,
) => {
  try {
    const url = getAPIEndpoint(
      `/properties/${propertyId}/rooms/${roomId}/occupants/${occupantId}`,
    );
    const response = await authFetch(url, {
      method: "DELETE",
    });
    const result: TApiResponse<null> = await processResult(response);

    if (result.code === "SUCCESS") {
      return true;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
