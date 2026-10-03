"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/store";
import { isPublicRoute } from "@/lib/helpers";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/lib/constants";
import { Loading } from "../Loading";

type TAuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: TAuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isLoading, validateSession } = useAuth()

  useEffect(() => {
    void validateSession();
  }, [validateSession])

  useEffect(() => {
    if (pathname === null || isLoading) return;

    if (!isPublicRoute(pathname) && !isAuthenticated) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    if (isPublicRoute(pathname) && isAuthenticated) {
      router.replace(HOME_ROUTE);
    }

  }, [pathname, isAuthenticated, isLoading, router])

  if (isLoading || pathname === null || (!isPublicRoute(pathname) && !isAuthenticated)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return <>{children}</>;

};
