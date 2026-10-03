import type { Metadata } from "next";

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

export const metadata: Metadata = {
  title: `Sign in | ${appName}`,
  description: "Sign in to the boarding house dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
