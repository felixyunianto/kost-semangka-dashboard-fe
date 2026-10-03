import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type {
  TApiResponse,
  TTestEmailResult,
  TTestOccupantEmailPayload,
} from "@/lib/entities";

const toTestEmailResult = (
  result: TApiResponse<Pick<TTestEmailResult, "email" | "deliveredTo">>,
  fallbackEmail: string,
): TTestEmailResult => {
  return {
    message: result.message,
    email: result.data?.email ?? fallbackEmail,
    deliveredTo: result.data?.deliveredTo,
  };
};

export const sendPreviewTestEmail = async (payload: TTestOccupantEmailPayload) => {
  try {
    const url = getAPIEndpoint("/occupants/test-email");
    const response = await authFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        ...(payload.fullName?.trim() ? { fullName: payload.fullName.trim() } : {}),
        ...(payload.propertyName?.trim() ? { propertyName: payload.propertyName.trim() } : {}),
      }),
    });
    const result: TApiResponse<Pick<TTestEmailResult, "email" | "deliveredTo">> =
      await processResult(response);

    if (result.code === "SUCCESS") {
      return toTestEmailResult(result, payload.email.trim());
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};

export const sendOccupantTestEmail = async (occupantId: string) => {
  try {
    const url = getAPIEndpoint(`/occupants/${occupantId}/test-email`);
    const response = await authFetch(url, {
      method: "POST",
    });
    const result: TApiResponse<Pick<TTestEmailResult, "email" | "deliveredTo">> =
      await processResult(response);

    if (result.code === "SUCCESS") {
      return toTestEmailResult(result, "");
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
