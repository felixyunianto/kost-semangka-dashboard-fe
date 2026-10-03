import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit property",
};

export default function EditPropertyLayout({ children }: { children: ReactNode }) {
  return children;
}
