"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirthdayCat } from "./BirthdayCat";
import { useReducedMotion } from "./effects";
import { SEALED, JOURNEY, type DayConfig } from "@/lib/birthday/config";
import { DoodleHeart, DoodleSparkle } from "./doodles";
import { currentUnlockedDay } from "@/lib/birthday/dates";
import { PageDecor } from "./PageDecor";

/**
 * DAY 12 — SEALED LETTER: the suspense page.
 * tap → envelope wiggles → seal glows → cat covers it → envelope backs
 * away → cat shakes head → "Not yet." → "Open tomorrow ♡"
 * A tiny countdown toward September 13 sits underneath.
 */
export function SealedScene({ day }: { day: DayConfig }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0); // 1 wiggle, 2 glow, 3 cover, 4 refuse, 5 shake+message
  const [nudges, setNudges] = useState(0);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    // how many days until September 13 in the journey timezone
    const now = currentUnlockedDay();
    setDaysLeft(Math.max(JOURNEY.birthdayDay - now, 0));
  }, []);

  function tap() {
    if (step >= 5) {
      setNudges((n) => n + 1);
      return;
    }
    const next = step + 1;
    setStep(next);
    const d = reduced ? [0, 0, 0, 0] : [550, 1100, 1800, 2400];
    setTimeout(() => setStep(Math.min(step + 2, 5)), d[0]);
    setTimeout(() => setStep(Math.min(step + 3, 5)), d[1]);
    setTimeout(() => setStep(5), d[2]);
  }

  return (
    <div className="select-none">
      <PageDecor theme="sealed" />
      <div className="relative z-10">
      <Stage>
        {/* envelope + guardian cat */}
        <div className="relative z-10 cursor-pointer" onClick={tap} role="button" aria-label="Try to open the letter">
          <motion.div
            className="relative mx-auto w-60 sm:w-72"
            animate={
              step === 1
                ? { rotate: [0, -3, 3, -2, 0] }
                : step >= 4
                  ? { x: 0, y: 10 } // backs slightly away
                  : {}
            }
            transition={step === 1 ? { duration: 0.5 } : { duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] rounded-lg bg-[color:var(--bday-paper)] shadow-xl" style={{ border: "2px solid rgba(91,66,50,.2)" }}>
              <div
                className="absolute inset-x-0 top-0 h-1/2 rounded-t-lg"
                style={{
                  background: "var(--bday-cream-deep)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  borderBottom: "2px solid rgba(91,66,50,.15)",
                }}
              />
              {/* wax seal — glows when tapped */}
              <motion.div
                className="absolute left-1/2 top-1/2 -ml-7 -mt-7 grid h-14 w-14 place-items-center rounded-full bg-[color:var(--bday-rose)] ring-4 ring-[color:var(--bday-rose-deep)]/30"
                animate={
                  step >= 2
                    ? { boxShadow: ["0 0 0px rgba(217,179,108,0)", "0 0 22px rgba(217,179,108,.85)", "0 0 10px rgba(217,179,108,.5)"] }
                    : {}
                }
                transition={{ duration: 1.2, repeat: step >= 2 ? Infinity : 0, repeatType: "reverse" }}
              >
                <DoodleHeart size={26} className="text-[#f7efe1]" />
              </motion.div>
            </div>
          </motion.div>

          {/* the cat covering the envelope with its paws */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2"
            animate={
              step >= 3
                ? { y: [0, -6, 0], rotate: step >= 5 ? [0, -5, 5, -3, 0] : 0 } // leans on it, then shakes head
                : { y: 0 }
            }
            transition={{ duration: step >= 5 ? 0.8 : 0.5 }}
          >
            <BirthdayCat pose="cover-envelope" size={125} />
          </motion.div>

          {/* tiny sparkle of stubbornness */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 0.9], opacity: [0, 1, 0.8] }}
                className="absolute -top-2 right-6"
              >
                <DoodleSparkle size={20} className="text-[color:var(--bday-gold)]" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Stage>

      {/* the refusal copy, staged */}
      <div className="mt-10 min-h-[92px] text-center">
        <AnimatePresence mode="wait">
          {step >= 5 ? (
            <motion.div key="refusal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <motion.p
                key={nudges}
                initial={{ rotate: nudges % 2 ? -2 : 2, opacity: 0.6 }}
                animate={{ rotate: 0, opacity: 1 }}
                className="bday-hand text-3xl text-[color:var(--bday-rose-deep)]"
              >
                {SEALED.notYet}
              </motion.p>
              <p className="bday-hand mt-1 text-2xl text-[color:var(--bday-coffee)]">{SEALED.tomorrow}</p>
            </motion.div>
          ) : step > 0 ? (
            <motion.p key="mid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bday-scrawl text-lg opacity-60">
              mochi is guarding it...
            </motion.p>
          ) : (
            <p className="bday-scrawl text-lg opacity-60">tap the envelope...</p>
          )}
        </AnimatePresence>
      </div>

      {/* countdown to September 13 */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => (
            <span
              key={d}
              className={`h-2 w-2 rounded-full ${
                daysLeft !== null && d > daysLeft
                  ? "bg-[color:var(--bday-rose)]"
                  : "bg-[color:var(--bday-cream-deep)]"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="bday-scrawl text-sm opacity-70">
          {daysLeft === 1
            ? "tomorrow is the day ♡"
            : daysLeft !== null
              ? `${daysLeft} little day${daysLeft === 1 ? "" : "s"} to go...`
              : ""}
        </p>
      </div>

      {day.note && (
        <p className="bday-scrawl mt-2 text-center text-sm text-[color:var(--bday-rose-deep)]">{day.note}</p>
      )}
      </div>
    </div>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return <div className="relative flex min-h-[280px] items-end justify-center pb-10">{children}</div>;
}
