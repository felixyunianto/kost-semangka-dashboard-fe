import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TPaginated, TPayment, TPaymentParamList } from "@/lib/entities";

const toPaymentQuery = (filter: TPaymentParamList) => {
  return {
    page: filter.page,
    limit: filter.limit,
    ...(filter.invoiceNumber?.trim() && { invoiceNumber: filter.invoiceNumber.trim() }),
    ...(filter.occupantName?.trim() && { occupantName: filter.occupantName.trim() }),
    ...(filter.propertyId?.trim() && { propertyId: filter.propertyId.trim() }),
    ...(filter.status && { status: filter.status }),
    ...(filter.gateway && { gateway: filter.gateway }),
    ...(filter.paidFrom?.trim() && { paidFrom: filter.paidFrom.trim() }),
    ...(filter.paidTo?.trim() && { paidTo: filter.paidTo.trim() }),
    ...(filter.billId?.trim() && { billId: filter.billId.trim() }),
  };
};

export const getPayments = async (filter: TPaymentParamList) => {
  try {
    const url = getAPIEndpoint("/payments", toPaymentQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TPayment>> = await processResult(response);

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
