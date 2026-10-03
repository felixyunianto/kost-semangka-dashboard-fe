import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TFinanceKind } from "@/lib/entities";
import { financeKindPath } from "@/lib/entities";

export const deleteFinanceEntry = async (kind: TFinanceKind, entryId: string) => {
  try {
    const url = getAPIEndpoint(`/finances/${financeKindPath(kind)}/${entryId}`);
    const response = await authFetch(url, {
      method: "DELETE",
    });
    const result: TApiResponse<{ message?: string } | null> = await processResult(response);

    if (result.code === "SUCCESS") {
      return true;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
