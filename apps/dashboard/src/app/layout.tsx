import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kavah Dashboard",
  description: "Manage your community and create matches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
