import { create } from "zustand";
import { StoreState } from "./types";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

import { createAuthSlice } from "./slices/auth-slice";
import { createLocaleSlice } from "./slices/locale-slice";

export const useStore = create<StoreState>()(
  devtools(
    immer((...a) => ({
      ...createAuthSlice(...a),
      ...createLocaleSlice(...a),
    })),
    { name: "BoardingHouseManagementSystem" },
  ),
);

export const useAuth = () =>
  useStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      logout: state.logout,
      setAuth: state.setAuth,
      validateSession: state.validateSession,
    })),
  );

export { toast, useToastStore } from "./toast";

export const useLocale = () => 
  useStore(
    useShallow((state) => ({
      locale: state.locale,
      setLocale: state.setLocale,
      initializeLocale: state.initializeLocale,
    }))
  )
