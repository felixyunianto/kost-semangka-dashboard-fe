import { ParsedUrlQueryInput } from "querystring";
import { PUBLIC_ROUTES } from "../constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type TQueryValue = string | number | boolean | null | undefined;

export const toQueryString = (params?: Record<string, TQueryValue>) => {
    if (!params) {
        return "";
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        searchParams.set(key, String(value));
    });

    const query = searchParams.toString();

    return query ? `?${query}` : "";
};

export const getAPIEndpoint = (
    url: string,
    params?: Record<string, TQueryValue>,
) => {
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${API_URL}${path}${toQueryString(params)}`;
}

export const isPublicRoute = (pathname: string) => {
    return PUBLIC_ROUTES.some((route) => pathname === route);
}

export const buildPathnameWithQueryPath = (
    pathname: string,
    currentSearch: URLSearchParams,
    patch: ParsedUrlQueryInput | null | undefined,
): string => {
    if (patch === undefined || patch === null) return pathname;

    const next = new URLSearchParams(currentSearch?.toString());

    for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null) {
            next.delete(key);
        } else if (Array.isArray(value)) {
            next.delete(key);
            for (const item of value) {
                next.append(key, String(item));
            }
        } else {
            next.set(key, String(value));
        }
    }

    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}