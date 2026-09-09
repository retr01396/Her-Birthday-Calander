import type { Metadata } from "next";
import { BirthdayChrome } from "@/components/birthday/BirthdayChrome";
import "./birthday.css";

export const metadata: Metadata = {
  title: "13 Little Days ♡",
  description:
    "A handmade birthday scrapbook that became a little interactive world.",
};

export default function BirthdayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bday-root">
      <div className="bday-grain" aria-hidden="true" />
      <BirthdayChrome>{children}</BirthdayChrome>
    </div>
  );
}
