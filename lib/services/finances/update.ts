import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type {
  TApiResponse,
  TFinanceEntry,
  TFinanceKind,
  TUpdateFinanceEntryPayload,
} from "@/lib/entities";
import { financeKindPath } from "@/lib/entities";

export const updateFinanceEntry = async (
  kind: TFinanceKind,
  entryId: string,
  payload: TUpdateFinanceEntryPayload,
) => {
  try {
    const url = getAPIEndpoint(`/finances/${financeKindPath(kind)}/${entryId}`);
    const response = await authFetch(url, {
      method: "PATCH",
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
