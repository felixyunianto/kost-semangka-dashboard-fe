import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Add property",
};

export default function NewPropertyLayout({ children }: { children: ReactNode }) {
  return children;
}
