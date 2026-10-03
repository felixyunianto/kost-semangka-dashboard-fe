import { getAPIEndpoint } from "@/lib/helpers";
import type { TApiResponse, TRefreshPayload, TRefreshResponse } from "@/lib/entities";

export const submitRefresh = async (payload: TRefreshPayload) => {
  const url = getAPIEndpoint("/auth/refresh");
  const response = await fetch(url, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result: TApiResponse<TRefreshResponse> = await response.json().catch(() => {
    return {
      code: "INTERNAL_ERROR",
      message: response.statusText,
      data: null,
    };
  });

  return {
    ok: response.ok,
    status: response.status,
    result,
  };
};
