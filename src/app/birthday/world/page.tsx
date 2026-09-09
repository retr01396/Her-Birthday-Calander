import { redirect } from "next/navigation";
import { isDayUnlocked } from "@/lib/birthday/dates";
import { JOURNEY } from "@/lib/birthday/config";
import { LittleWorld } from "@/components/birthday/LittleWorld";

export const metadata = { title: "Our Little World ♡ 13 Little Days" };

export default async function WorldPage() {
  // The room only exists after the birthday reveal.
  if (!isDayUnlocked(JOURNEY.birthdayDay)) {
    redirect("/birthday/journey");
  }
  return <LittleWorld />;
}

export const dynamic = "force-dynamic";
