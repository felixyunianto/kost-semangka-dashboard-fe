import { getAccessToken, refreshSession } from "./auth/session";

const getRefreshedAccessToken = async () => {
  const refresh = await refreshSession();

  if (refresh.kind !== "ok") {
    return null;
  }

  return refresh.tokens.accessToken;
};

export const authFetch = async (input: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  let accessToken = getAccessToken();
  let didRefresh = false;

  if (!accessToken) {
    accessToken = await getRefreshedAccessToken();
    didRefresh = Boolean(accessToken);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401 || didRefresh) {
    return response;
  }

  const nextAccessToken = await getRefreshedAccessToken();

  if (!nextAccessToken) {
    return response;
  }

  headers.set("Authorization", `Bearer ${nextAccessToken}`);

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
};
