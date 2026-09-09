"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DAYS } from "@/lib/birthday/config";
import { currentUnlockedDay, startingDay } from "@/lib/birthday/dates";
import {
  DoodleFlower,
  DoodleChocolate,
  DoodleCoffee,
  DoodlePlushie,
  DoodleGift,
  DoodleLetter,
  DoodleRose,
  DoodlePolaroid,
  DoodleHeart,
  DoodleLock,
  DoodleMoon,
  DoodleCake,
  DoodleBow,
  DoodleSparkle,
  DoodleStar,
} from "@/components/birthday/doodles";
import { FloatingPetals, DoodleDivider } from "@/components/birthday/effects";
import { PageDecor } from "@/components/birthday/PageDecor";
import { useEffect, useState, type ComponentType } from "react";

/** Hand-drawn icon per day — no standard emoji. */
const KIND_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  flowers: DoodleFlower,
  chocolates: DoodleChocolate,
  coffee: DoodleCoffee,
  plushie: DoodlePlushie,
  gift: DoodleGift,
  letter: DoodleLetter,
  roses: DoodleRose,
  memory: DoodlePolaroid,
  heart: DoodleHeart,
  mystery: DoodleGift,
  moon: DoodleMoon,
  sealed: DoodleLetter,
  birthday: DoodleCake,
};

export default function JourneyCalendarPage() {
  // Render with the server-computed starting day first, then sync with the
  // real clock after mount — keeps SSR markup stable on refresh.
  const [unlocked, setUnlocked] = useState<number>(startingDay());
  useEffect(() => {
    setUnlocked(currentUnlockedDay());
  }, []);

  return (
    <div className="bday-center !min-h-auto relative py-10">
      <PageDecor theme="flowers" />
      <FloatingPetals count={8} />

      <div className="bday-max relative z-10" style={{ maxWidth: 640 }}>
        {/* sticker cluster around the header */}
        <div className="pointer-events-none absolute -left-1 -top-6 hidden sm:block">
          <DoodleFlower size={44} className="bday-sway text-[color:var(--bday-rose)]" />
        </div>
        <div className="pointer-events-none absolute -right-2 top-10 hidden sm:block">
          <DoodleStar size={30} className="bday-twinkle text-[color:var(--bday-gold)]" />
        </div>

        <header className="relative mb-8 text-center">
          <DoodleDivider />
          <motion.h1
            className="bday-h1 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            September
          </motion.h1>
          <p className="bday-message opacity-75">
            thirteen little days — collect them all ♡
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 opacity-70">
            <DoodleHeart size={14} className="text-[color:var(--bday-blush)]" />
            <DoodleBow size={20} className="text-[color:var(--bday-rose)]" />
            <DoodleHeart size={14} className="text-[color:var(--bday-blush)]" />
          </div>
        </header>

        <div className="relative grid grid-cols-3 gap-3 pb-16 sm:grid-cols-4 sm:gap-4">
          {DAYS.map((d, i) => {
            const isPast = d.day < unlocked;
            const isToday = d.day === unlocked;
            const isFuture = d.day > unlocked;
            const isBirthday = d.kind === "birthday";
            const Icon = KIND_ICON[d.kind] ?? DoodleSparkle;

            const tile = (
              <>
                {/* collected / completed stamp */}
                {isPast && (
                  <span className="bday-scrawl absolute right-2 top-1.5 -rotate-12 text-xs text-[color:var(--bday-sage)]">
                    ✓ got it
                  </span>
                )}
                {/* heart/bow indicator for the current day */}
                {isToday && (
                  <span className="bday-badge-heart">
                    <DoodleBow size={26} className="text-[color:var(--bday-rose-deep)]" />
                  </span>
                )}
                {/* future lock */}
                {isFuture && (
                  <span className="bday-lock">
                    <DoodleLock size={22} />
                  </span>
                )}
                <span className="bday-scrawl text-xs opacity-60">
                  {String(d.day).padStart(2, "0")}
                </span>
                <motion.span
                  className="inline-block"
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                >
                  <Icon
                    size={40}
                    className={
                      isFuture
                        ? "opacity-50"
                        : "drop-shadow-sm text-[color:var(--bday-rose)]"
                    }
                  />
                </motion.span>
                <span className="bday-hand text-[15px] leading-tight text-[color:var(--bday-cocoa)]">
                  {d.title}
                </span>
              </>
            );

            return (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, y: 14, rotate: i % 2 ? 1.5 : -1.5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                {isFuture ? (
                  <div
                    className={`bday-tile ${isBirthday ? "bday-tile--birthday" : ""} bday-tile--future`}
                    aria-disabled="true"
                    title="not yet ♡"
                  >
                    {tile}
                  </div>
                ) : (
                  <Link
                    href={`/birthday/day/${d.day}`}
                    className={`bday-tile ${isPast ? "bday-tile--past" : ""} ${
                      isToday ? "bday-tile--today" : ""
                    } ${isBirthday ? "bday-tile--birthday" : ""}`}
                  >
                    {tile}
                  </Link>
                )}
              </motion.div>
            );
          })}

          {/* little corner doodles on the grid itself */}
          <div className="pointer-events-none absolute -bottom-1 left-2 opacity-70">
            <DoodleHeart size={20} className="text-[color:var(--bday-blush)]" />
          </div>
          <div className="pointer-events-none absolute -bottom-2 right-4 opacity-70">
            <DoodleFlower size={26} className="text-[color:var(--bday-sage)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
