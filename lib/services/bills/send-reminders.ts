import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TSendRemindersResult } from "@/lib/entities";

export const sendBillReminders = async () => {
  try {
    const url = getAPIEndpoint("/bills/send-reminders");
    const response = await authFetch(url, {
      method: "POST",
    });
    const result: TApiResponse<TSendRemindersResult> = await processResult(response);

    if (result.code === "SUCCESS" && result.data) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
