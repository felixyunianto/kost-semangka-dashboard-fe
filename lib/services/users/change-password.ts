import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TChangePasswordPayload } from "@/lib/entities";

export const changePassword = async (payload: TChangePasswordPayload) => {
  try {
    const url = getAPIEndpoint("/users/change-password");
    const response = await authFetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
