import Cookies from "js-cookie";
import { StateCreator } from "zustand";

import type { StoreState } from "../types";
import type { TLocale } from "@/lib/i18n";

export type TLocaleSlice = {
    locale: TLocale;
    setLocale: (locale: TLocale) => void;
    initializeLocale: () => void
}

export const createLocaleSlice: StateCreator<
    StoreState,
    [],
    [],
    TLocaleSlice
> = (set) => ({
    locale: 'en',
    setLocale: (locale) => {
        Cookies.set('locale', locale, { expires: 365 });

        set({ locale });
    },
    initializeLocale: () => {
        const locale = (Cookies.get("locale") as TLocale) || "en";

        set({ locale });
    }
})