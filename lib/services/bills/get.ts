import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TBill } from "@/lib/entities";

export const getBill = async (billId: string) => {
  try {
    const url = getAPIEndpoint(`/bills/${billId}`);
    const response = await authFetch(url);
    const result: TApiResponse<TBill> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
