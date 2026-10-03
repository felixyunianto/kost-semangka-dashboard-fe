import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult } from "../utils";

import type { TApiResponse, TFinanceCategory } from "@/lib/entities";
import { FINANCE_CATEGORIES } from "@/lib/entities";

export const getFinanceCategories = async () => {
  try {
    const url = getAPIEndpoint("/finances/categories");
    const response = await authFetch(url);
    const result: TApiResponse<TFinanceCategory[]> = await processResult(response);

    if (result.code === "SUCCESS" && Array.isArray(result.data)) {
      return result.data;
    }

    return [...FINANCE_CATEGORIES];
  } catch {
    return [...FINANCE_CATEGORIES];
  }
};
