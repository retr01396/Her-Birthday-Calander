"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DayConfig } from "@/lib/birthday/config";
import { DoodleDivider } from "./effects";
import { PageDecor, type DecorTheme } from "./PageDecor";
import type { ReactNode } from "react";

/**
 * DayShell — shared chrome for a day page.
 * The "back to the calendar" control uses an explicit router.push to
 * /birthday/journey so it works before/during/after any scene's
 * animation state, on desktop and mobile, even while the Day 7
 * cinematic's fixed layers are mounted.
 */
export function DayShell({
  day,
  nextDay,
  nextUnlocked,
  children,
}: {
  day: DayConfig;
  nextDay: number | null;
  nextUnlocked: boolean;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="bday-center !min-h-auto relative py-8">
      {/* themed illustrated environment framing the page */}
      <PageDecor theme={day.kind as DecorTheme} />

      <div className="bday-max relative z-10" style={{ maxWidth: 520 }}>
        <header className="mb-2 text-center">
          <button
            type="button"
            onClick={() => router.push("/birthday/journey")}
            className="bday-paw bday-scrawl cursor-pointer text-sm text-[color:var(--bday-rose-deep)] hover:underline"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            ← back to the calendar
          </button>
          <DoodleDivider className="my-3" />
          <h1 className="bday-h1">{day.heading}</h1>
        </header>

        <div className="bday-paper-card bday-taped mt-6 pt-10">{children}</div>

        <nav className="bday-row mt-8">
          {nextDay !== null && nextUnlocked ? (
            <Link href={`/birthday/day/${nextDay}`} className="bday-btn">
              day {String(nextDay).padStart(2, "0")} →
            </Link>
          ) : nextDay !== null ? (
            <span className="bday-scrawl text-lg opacity-60">
              day {String(nextDay).padStart(2, "0")} unlocks tomorrow ♡
            </span>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
