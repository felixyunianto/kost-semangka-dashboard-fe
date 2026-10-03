import type { StateCreator } from "zustand";
import { StoreState } from "../types";

import type { TUser } from "@/lib/entities";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  refreshSession,
  submitLogout,
  submitValidate,
} from "@/lib/services";
import { isTransientHttpFailure } from "@/lib/services/utils";

type Mutators = [["zustand/devtools", never], ["zustand/immer", never]];

export type TAuthSlice = {
  user: TUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  setAuth: (user: TUser) => void;
  validateSession: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const failSession = (
  set: Parameters<StateCreator<StoreState, Mutators, [], TAuthSlice>>[0],
  error: string | null = null,
) => {
  clearSession();
  set({
    isAuthenticated: false,
    user: null,
    error,
    isLoading: false,
  });
};

const keepSession = (
  set: Parameters<StateCreator<StoreState, Mutators, [], TAuthSlice>>[0],
  error: string | null = null,
) => {
  const user = getStoredUser();

  set({
    isAuthenticated: Boolean(user || getAccessToken() || getRefreshToken()),
    user,
    error,
    isLoading: false,
  });
};

export const createAuthSlice: StateCreator<
  StoreState,
  Mutators,
  [],
  TAuthSlice
> = (set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setAuth: (user) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },
  logout: () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      void submitLogout({ refreshToken }).catch(() => undefined);
    }

    failSession(set);
  },
  validateSession: async () => {
    set({ isLoading: true, error: null });

    try {
      let accessToken = getAccessToken();

      if (!accessToken) {
        const refresh = await refreshSession();

        if (refresh.kind === "transient") {
          keepSession(set, refresh.message);
          return;
        }

        if (refresh.kind !== "ok") {
          failSession(set);
          return;
        }

        accessToken = refresh.tokens.accessToken;
      }

      let { ok, status, result } = await submitValidate(accessToken);

      if (!ok && isTransientHttpFailure(status, result.code)) {
        keepSession(set, result.message || "Too many requests");
        return;
      }

      if (!ok) {
        const refresh = await refreshSession();

        if (refresh.kind === "transient") {
          keepSession(set, refresh.message);
          return;
        }

        if (refresh.kind !== "ok") {
          failSession(set, result.message || "Session validation failed");
          return;
        }

        ({ ok, status, result } = await submitValidate(refresh.tokens.accessToken));

        if (!ok && isTransientHttpFailure(status, result.code)) {
          keepSession(set, result.message || "Too many requests");
          return;
        }
      }

      const session = result.data ?? null;
      const isValid = session?.valid === true;
      const user = session?.user ?? getStoredUser();

      if (!ok || !isValid) {
        failSession(set, result.message || "Session validation failed");
        return;
      }

      set({
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      if (getAccessToken() || getRefreshToken() || getStoredUser()) {
        keepSession(
          set,
          error instanceof Error ? error.message : "Session validation failed",
        );
        return;
      }

      failSession(
        set,
        error instanceof Error ? error.message : "Session validation failed",
      );
    }
  },
});
