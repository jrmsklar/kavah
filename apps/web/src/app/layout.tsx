import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kavah — Community Matchmaking",
  description: "Find your match through the people who know you best.",
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
