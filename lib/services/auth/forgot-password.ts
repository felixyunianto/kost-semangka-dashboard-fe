import { getAPIEndpoint } from "@/lib/helpers";
import { processResult, throwErrorUtil } from "../utils";

import type {
  TApiResponse,
  TForgotPasswordPayload,
  TForgotPasswordResult,
  TResendResetOtpPayload,
  TResetPasswordPayload,
  TVerifyResetOtpPayload,
} from "@/lib/entities";

const postAuth = async <T>(path: string, payload: unknown) => {
  try {
    const url = getAPIEndpoint(path);
    const response = await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result: TApiResponse<T> = await processResult(response);

    if (result.code === "SUCCESS") {
      return result;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};

export const submitForgotPassword = async (payload: TForgotPasswordPayload) => {
  const result = await postAuth<TForgotPasswordResult>("/auth/forgot-password", {
    email: payload.email.trim(),
  });

  return {
    challengeId: result?.data?.challengeId,
  };
};

export const submitVerifyResetOtp = async (payload: TVerifyResetOtpPayload) => {
  await postAuth("/auth/forgot-password/verify", {
    challengeId: payload.challengeId,
    otp: payload.otp.trim(),
  });
};

export const submitResendResetOtp = async (payload: TResendResetOtpPayload) => {
  await postAuth("/auth/forgot-password/resend", {
    challengeId: payload.challengeId,
  });
};

export const submitResetPassword = async (payload: TResetPasswordPayload) => {
  await postAuth("/auth/reset-password", {
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  });
};
