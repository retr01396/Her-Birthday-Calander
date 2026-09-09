import { notFound, redirect } from "next/navigation";
import { DAYS } from "@/lib/birthday/config";
import { isDayUnlocked, currentUnlockedDay } from "@/lib/birthday/dates";
import { DayShell } from "@/components/birthday/DayShell";
import {
  FlowersScene,
  ChocolatesScene,
  CoffeeScene,
  PlushieScene,
  GiftScene,
  LetterScene,
  MemoryScene,
  HeartScene,
  MysteryScene,
} from "@/components/birthday/day-scenes";
import {
  RoseCinematicScene,
  MoonScene,
} from "@/components/birthday/moon-rose-scenes";
import { SealedScene } from "@/components/birthday/SealedScene";
import { BirthdayFinaleScene } from "@/components/birthday/BirthdayFinaleScene";

export function generateStaticParams() {
  return DAYS.map((d) => ({ day: String(d.day) }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day: dayParam } = await params;
  const day = Number(dayParam);

  if (!Number.isInteger(day) || day < 1 || day > 13) notFound();

  // Defense-in-depth: the middleware already blocks locked days, but this
  // server re-check guarantees future content never renders even if the
  // middleware is bypassed (e.g. direct RSC/preview fetch).
  if (!isDayUnlocked(day)) {
    redirect("/birthday/journey");
  }

  const config = DAYS.find((d) => d.day === day);
  if (!config) notFound();

  // Day 13 is the grand finale.
  if (day === 13) return <BirthdayFinaleScene />;

  const nextDay = day < 13 ? day + 1 : null;
  const nextUnlocked = nextDay !== null && isDayUnlocked(nextDay);

  return (
    <DayShell day={config} nextDay={nextDay} nextUnlocked={nextUnlocked}>
      {day === 1 && <FlowersScene day={config} />}
      {day === 2 && <ChocolatesScene day={config} />}
      {day === 3 && <CoffeeScene day={config} />}
      {day === 4 && <PlushieScene day={config} />}
      {day === 5 && <GiftScene day={config} />}
      {day === 6 && <LetterScene day={config} />}
      {day === 7 && <RoseCinematicScene day={config} />}
      {day === 8 && <MemoryScene day={config} />}
      {day === 9 && <HeartScene day={config} />}
      {day === 10 && <MysteryScene day={config} />}
      {day === 11 && <MoonScene day={config} />}
      {day === 12 && <SealedScene day={config} />}
    </DayShell>
  );
}

export function generateMetadata({ params }: { params: Promise<{ day: string }> }) {
  return params.then(({ day: dayParam }) => {
    const config = DAYS.find((d) => d.day === Number(dayParam));
    return { title: config ? `${config.heading} ♡ 13 Little Days` : "13 Little Days" };
  });
}

export const dynamic = "force-dynamic";
