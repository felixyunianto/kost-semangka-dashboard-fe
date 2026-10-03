import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TGenerateMissingResult } from "@/lib/entities";

export const generateMissingBills = async () => {
  try {
    const url = getAPIEndpoint("/bills/generate-missing");
    const response = await authFetch(url, {
      method: "POST",
    });
    const result: TApiResponse<TGenerateMissingResult> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
