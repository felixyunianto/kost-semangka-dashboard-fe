import { getAPIEndpoint } from "@/lib/helpers";
import type { TApiResponse, TUser } from "@/lib/entities";

export type TValidateSession = {
  valid: boolean;
  user: TUser;
};

export const submitValidate = async (accessToken: string) => {
  const url = getAPIEndpoint("/auth/validate");

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result: TApiResponse<TValidateSession> = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    result,
  };
};
