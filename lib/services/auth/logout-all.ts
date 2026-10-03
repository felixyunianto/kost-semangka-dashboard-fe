import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse } from "@/lib/entities";

export const submitLogoutAll = async () => {
  try {
    const url = getAPIEndpoint("/auth/logout-all");
    const response = await authFetch(url, {
      method: "POST",
    });
    const result: TApiResponse<null> = await processResult(response);

    if (result.code === "SUCCESS") {
      return result;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
