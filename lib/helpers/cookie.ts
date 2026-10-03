import Cookies from "js-cookie";

const DEFAULT_OPTIONS: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export const setCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) => {
  Cookies.set(name, value, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
  Cookies.remove(name, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
};
