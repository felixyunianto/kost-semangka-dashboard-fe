import type { Metadata } from "next";

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

export const metadata: Metadata = {
  title: `Forgot password | ${appName}`,
  description: "Reset your boarding house dashboard password.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
