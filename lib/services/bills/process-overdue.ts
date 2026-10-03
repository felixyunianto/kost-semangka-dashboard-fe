import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TProcessOverdueResult } from "@/lib/entities";

export const processOverdueBills = async () => {
  try {
    const url = getAPIEndpoint("/bills/process-overdue");
    const response = await authFetch(url, {
      method: "POST",
    });
    const result: TApiResponse<TProcessOverdueResult> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
