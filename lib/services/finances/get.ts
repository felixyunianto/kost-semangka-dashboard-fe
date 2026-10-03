import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TFinanceEntry, TFinanceKind } from "@/lib/entities";
import { financeKindPath } from "@/lib/entities";

export const getFinanceEntry = async (kind: TFinanceKind, entryId: string) => {
  try {
    const url = getAPIEndpoint(`/finances/${financeKindPath(kind)}/${entryId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TFinanceEntry> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
