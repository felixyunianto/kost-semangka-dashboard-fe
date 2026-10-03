import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit occupant",
};

export default function EditOccupantLayout({ children }: { children: ReactNode }) {
  return children;
}
