import en from "./en";
import id from "./id";

export const dictionaries = {
    en,
    id,
} as const

export type TLocale = keyof typeof dictionaries;

