import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type {
  TApiResponse,
  TCreateFinanceEntryPayload,
  TFinanceEntry,
  TFinanceKind,
} from "@/lib/entities";
import { financeKindPath } from "@/lib/entities";

export const createFinanceEntry = async (
  kind: TFinanceKind,
  payload: TCreateFinanceEntryPayload,
) => {
  try {
    const url = getAPIEndpoint(`/finances/${financeKindPath(kind)}`);
    const response = await authFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result: TApiResponse<TFinanceEntry> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
