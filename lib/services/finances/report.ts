import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TFinanceReport, TFinanceReportFilter } from "@/lib/entities";

const toReportQuery = (filter: TFinanceReportFilter) => {
  return {
    ...(filter.propertyId?.trim() && { propertyId: filter.propertyId.trim() }),
    ...(filter.from?.trim() && { from: filter.from.trim() }),
    ...(filter.to?.trim() && { to: filter.to.trim() }),
  };
};

export const getFinanceReport = async (filter: TFinanceReportFilter) => {
  try {
    const url = getAPIEndpoint("/finances/reports", toReportQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TFinanceReport> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
