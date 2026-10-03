import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Occupants",
};

export default function OccupantsLayout({ children }: { children: ReactNode }) {
  return children;
}
