import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TProperty } from "@/lib/entities";

export const getProperty = async (propertyId: string) => {
  try {
    const url = getAPIEndpoint(`/properties/${propertyId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TProperty> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
