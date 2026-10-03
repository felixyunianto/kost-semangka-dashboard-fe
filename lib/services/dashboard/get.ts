import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TDashboardSummary } from "@/lib/entities";

export const getDashboardSummary = async (propertyId?: string) => {
  try {
    const url = getAPIEndpoint("/dashboard", {
      ...(propertyId?.trim() && { propertyId: propertyId.trim() }),
    });
    const response = await authFetch(url);
    const result: TApiResponse<TDashboardSummary> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
