import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TPayment } from "@/lib/entities";

export const getPayment = async (paymentId: string) => {
  try {
    const url = getAPIEndpoint(`/payments/${paymentId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TPayment> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
