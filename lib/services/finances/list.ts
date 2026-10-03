import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type {
  TApiResponse,
  TFinanceEntry,
  TFinanceEntryParamList,
  TFinanceKind,
  TPaginated,
} from "@/lib/entities";
import { financeKindPath } from "@/lib/entities";

const toFinanceEntryQuery = (filter: TFinanceEntryParamList) => {
  return {
    page: filter.page,
    limit: filter.limit,
    ...(filter.description?.trim() && { description: filter.description.trim() }),
    ...(filter.propertyId?.trim() && { propertyId: filter.propertyId.trim() }),
    ...(filter.category && { category: filter.category }),
    ...(filter.occurredFrom?.trim() && { occurredFrom: filter.occurredFrom.trim() }),
    ...(filter.occurredTo?.trim() && { occurredTo: filter.occurredTo.trim() }),
  };
};

export const getFinanceEntries = async (
  kind: TFinanceKind,
  filter: TFinanceEntryParamList,
) => {
  try {
    const url = getAPIEndpoint(`/finances/${financeKindPath(kind)}`, toFinanceEntryQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TFinanceEntry>> = await processResult(response);

    const isSuccess =
      result.code === "SUCCESS" &&
      result.data &&
      Array.isArray(result.data.items) &&
      Boolean(result.data.pagination);

    if (isSuccess) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
