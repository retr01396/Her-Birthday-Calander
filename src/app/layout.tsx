import type { Metadata } from "next";
import { RegistrationsProvider } from "@/lib/registrations-store";
import { ScrollProgress } from "@/components/motion-primitives";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusHub - Campus Clubs, Events & Leaderboard",
  description:
    "Discover events, clubs, and live campus rankings. Join high-impact communities and see who's leading on the leaderboard.",
  keywords: ["campus", "club", "hackathon", "leaderboard", "students", "university"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body className="bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 font-body-md min-h-screen selection:bg-primary/20 antialiased">
        <RegistrationsProvider>
          <ScrollProgress />
          <main className="pt-20">
            {children}
          </main>
        </RegistrationsProvider>
      </body>
    </html>
  );
}
