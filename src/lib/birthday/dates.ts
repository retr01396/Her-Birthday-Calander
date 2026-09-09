import { DAYS, JOURNEY } from "./config";

/**
 * Timezone-aware date logic for the 13 Little Days journey.
 *
 * ALL unlock decisions flow through this file — the calendar UI, the day
 * pages and the middleware guard all call these helpers, so a future day
 * can never be revealed through the URL or the UI.
 */

/** Parse a YYYY-MM-DD string into wall-clock parts. */
function parseISODate(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** Offset (ms) that `timezone` is ahead of UTC at the given instant. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return asUTC - date.getTime();
}

/** Current wall-clock date in the journey's timezone, as {y, m, d}. */
export function nowInJourneyTZ(now: Date = new Date()): {
  y: number;
  m: number;
  d: number;
} {
  const shifted = new Date(now.getTime() + tzOffsetMs(now, JOURNEY.timezone));
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
  };
}

/** The journey's year, fixed at build/config time. */
export function journeyYear(): number {
  return JOURNEY.year;
}

/**
 * The day the journey should open on: September 1 always, even if the
 * real date is later (delivered after Sept 1 — the recipient starts at
 * the beginning).
 */
export function startingDay(): number {
  return JOURNEY.startDay;
}

/**
 * Highest day currently unlocked (0 if none yet).
 * Sept 1–9 are unlocked from delivery; Sept 10/11/12/13 unlock when the
 * real date in the journey timezone reaches that day.
 */
export function currentUnlockedDay(now: Date = new Date()): number {
  const { y, m, d } = nowInJourneyTZ(now);
  if (y > JOURNEY.year || (y === JOURNEY.year && m > JOURNEY.month)) {
    return JOURNEY.birthdayDay; // after September — everything stays open
  }
  if (y === JOURNEY.year && m === JOURNEY.month) {
    return Math.min(Math.max(d, JOURNEY.startDay), JOURNEY.birthdayDay);
  }
  return 0; // before September — nothing unlocked yet
}

/** Whether a specific journey day is unlocked right now. */
export function isDayUnlocked(day: number, now: Date = new Date()): boolean {
  return day >= JOURNEY.startDay && day <= currentUnlockedDay(now);
}

/** The latest unlocked day that has a scene (excludes nothing today). */
export function latestUnlockedDayConfig(now: Date = new Date()) {
  const unlocked = currentUnlockedDay(now);
  return DAYS.filter((d) => d.day <= unlocked);
}
