import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit room",
};

export default function EditRoomLayout({ children }: { children: ReactNode }) {
  return children;
}
