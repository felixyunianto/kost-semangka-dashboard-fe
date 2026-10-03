import React from "react";

// Providers
import { QueryProvider } from "@/lib/react-query";
import { AuthProvider } from "../AuthProvider/AuthProvider";
import { ToastViewport } from "../Toast";

type TAppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: TAppProviderProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <ToastViewport />
      </AuthProvider>
    </QueryProvider>
  );
}
