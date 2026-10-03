"use client"

import { useLocale } from "@/store";

import { dictionaries, TLocale } from "."
import { getObject } from "../helpers";
import React from "react";

type TParams = Record<string, string | number>;

export const useI18n = () => {
    const { locale } = useLocale();
    const d = dictionaries[locale as TLocale]

    const t = (key: string, params?: TParams) => {
        let text = getObject(d, key) ?? key;

        if (typeof text !== 'string') return key;
        if (!params) return text;

        return text?.replace(/\{(\w+)\}/g, (_, value) => String(params[value] ?? `{${value}}`))
    }

    const tRich = (key: string, params?: Record<string, React.ReactNode>) => {
        let text = getObject(d, key) ?? key;

        if (typeof text !== 'string') return key;

        return text?.split('/(\{\w+\})/g').map((part, index) => {
            const match = part.match(/^\{(\w+)\}$/);

            if (!match) {
                return part;
            }

            const paramKey = match[1];

            return React.createElement(
                React.Fragment,
                { key: index },
                params?.[paramKey] ?? part
            );

        })
    }

    return {
        locale,
        t,
        tRich
    }

}