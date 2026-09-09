import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "13 Little Days ♡",
  description: "A handmade birthday scrapbook that became a little interactive world.",
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
