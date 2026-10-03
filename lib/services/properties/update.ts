import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TProperty, TUpdatePropertyPayload } from "@/lib/entities";

export const updateProperty = async (
  propertyId: string,
  payload: TUpdatePropertyPayload,
) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}`);
    const response = await authFetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result: TApiResponse<TProperty> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
