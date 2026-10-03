import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TCheckoutOccupantPayload, TOccupant } from "@/lib/entities";

export const checkoutOccupant = async (
  occupantId: string,
  payload?: TCheckoutOccupantPayload,
) => {
  try {
    const url = getAPIEndpoint(`/occupants/${occupantId}/checkout`);
    const response = await authFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
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
