import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TBill } from "@/lib/entities";

export const markBillPaidCash = async (billId: string) => {
  try {
    const url = getAPIEndpoint(`/bills/${billId}/pay-cash`);
    const response = await authFetch(url, {
      method: "PATCH",
    });
    const result: TApiResponse<TBill> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
