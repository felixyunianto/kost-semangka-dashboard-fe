import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TBill, TBillParamList, TPaginated } from "@/lib/entities";

const toBillQuery = (filter: TBillParamList) => {
  return {
    page: filter.page,
    limit: filter.limit,
    ...(filter.invoiceNumber?.trim() && { invoiceNumber: filter.invoiceNumber.trim() }),
    ...(filter.occupantName?.trim() && { occupantName: filter.occupantName.trim() }),
    ...(filter.propertyId?.trim() && { propertyId: filter.propertyId.trim() }),
    ...(filter.status && { status: filter.status }),
    ...(filter.type && { type: filter.type }),
    ...(filter.dueDateFrom?.trim() && { dueDateFrom: filter.dueDateFrom.trim() }),
    ...(filter.dueDateTo?.trim() && { dueDateTo: filter.dueDateTo.trim() }),
  };
};

export const getBills = async (filter: TBillParamList) => {
  try {
    const url = getAPIEndpoint("/bills", toBillQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TBill>> = await processResult(response);

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
