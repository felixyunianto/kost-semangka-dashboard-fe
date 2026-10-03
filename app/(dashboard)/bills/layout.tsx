import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bills",
};

export default function BillsLayout({ children }: { children: ReactNode }) {
  return children;
}
