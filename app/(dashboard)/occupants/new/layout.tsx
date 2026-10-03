import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Add occupant",
};

export default function NewOccupantLayout({ children }: { children: ReactNode }) {
  return children;
}
