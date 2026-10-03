import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Add room",
};

export default function NewRoomLayout({ children }: { children: ReactNode }) {
  return children;
}
