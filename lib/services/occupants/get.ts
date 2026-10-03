import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TOccupant } from "@/lib/entities";

export const getOccupant = async (occupantId: string) => {
  try {
    const url = getAPIEndpoint(`/occupants/${occupantId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TOccupant> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
