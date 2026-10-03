import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_DAYS,
  USER_COOKIE,
} from "@/lib/constants";
import { getCookie, removeCookie, setCookie } from "@/lib/helpers";
import type { TLoginResponse, TRefreshResponse, TUser } from "@/lib/entities";
import { isTransientHttpFailure } from "../utils";
import { submitRefresh } from "./refresh";

export type TRefreshSessionResult =
  | { kind: "ok"; tokens: TRefreshResponse }
  | { kind: "missing" }
  | { kind: "invalid" }
  | { kind: "transient"; message: string };

let inFlightRefresh: Promise<TRefreshSessionResult> | null = null;

export const setTokens = (tokens: TRefreshResponse) => {
  const accessTokenExpires = new Date(Date.now() + ACCESS_TOKEN_MAX_AGE_MS);

  setCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    expires: accessTokenExpires,
  });
  setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    expires: REFRESH_TOKEN_MAX_AGE_DAYS,
  });
};

export const setSession = (session: TLoginResponse) => {
  setTokens(session);
  setCookie(USER_COOKIE, JSON.stringify(session.user), {
    expires: REFRESH_TOKEN_MAX_AGE_DAYS,
  });
};

export const getAccessToken = () => {
  return getCookie(ACCESS_TOKEN_COOKIE) ?? null;
};

export const getRefreshToken = () => {
  return getCookie(REFRESH_TOKEN_COOKIE) ?? null;
};

export const getStoredUser = (): TUser | null => {
  const raw = getCookie(USER_COOKIE);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TUser;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(USER_COOKIE);
};

export const refreshSession = async () => {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async (): Promise<TRefreshSessionResult> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return { kind: "missing" };
    }

    try {
      const { ok, status, result } = await submitRefresh({ refreshToken });

      if (ok && result.data) {
        setTokens(result.data);
        return { kind: "ok", tokens: result.data };
      }

      if (isTransientHttpFailure(status, result.code)) {
        return {
          kind: "transient",
          message: result.message || "Too many requests",
        };
      }

      return { kind: "invalid" };
    } catch (error) {
      return {
        kind: "transient",
        message:
          error instanceof Error ? error.message : "Unable to refresh session",
      };
    }
  })().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
};
