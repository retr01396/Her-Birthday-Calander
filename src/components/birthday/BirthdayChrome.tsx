"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { JOURNEY } from "@/lib/birthday/config";
import { FloatingHeartsAmbient } from "./effects";
import { DoodleBow, DoodleHeart } from "./doodles";
import { getBgmAudio, startBgm, pauseBgm, isBgmPlaying } from "@/lib/birthday/bgm";

/**
 * Shared scrapbook chrome for every birthday page:
 * a hand-lettered header, soft page transition, and a tiny cat
 * that occasionally runs across the bottom of the screen.
 */

export function BirthdayChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const day = pathname.match(/\/birthday\/day\/(\d+)/)?.[1];

  // ── global background music ──────────────────────────────────
  // Starts on her very first tap anywhere on the site, then keeps
  // looping across every page navigation until the site is closed.
  // Button state is synced from the audio element's own events, so
  // it can never drift out of sync with what's actually playing.
  const [bgmOn, setBgmOn] = useState(false);

  useEffect(() => {
    const a = getBgmAudio();
    const sync = () => setBgmOn(!a.paused);
    a.addEventListener("play", sync);
    a.addEventListener("pause", sync);
    sync();

    function firstTap() {
      startBgm();
      window.removeEventListener("pointerdown", firstTap, true);
      window.removeEventListener("keydown", firstTap, true);
    }
    window.addEventListener("pointerdown", firstTap, true);
    window.addEventListener("keydown", firstTap, true);
    return () => {
      a.removeEventListener("play", sync);
      a.removeEventListener("pause", sync);
      window.removeEventListener("pointerdown", firstTap, true);
      window.removeEventListener("keydown", firstTap, true);
    };
  }, []);

  function toggleBgm() {
    if (isBgmPlaying()) {
      pauseBgm();
    } else {
      startBgm();
    }
  }

  return (
    <>
      <FloatingHeartsAmbient count={7} />

      {/* ── cute hand-lettered header ─────────────────────────────
          ALWAYS navigates to the birthday calendar. Uses router.push
          (not a bare <Link> to /birthday) so the pill behaves as a
          reliable home button on every subpage, regardless of day
          state or running animations. */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="relative z-30 mx-auto mt-3 flex w-fit"
      >
        <button
          type="button"
          onClick={() => router.push("/birthday/journey")}
          aria-label="Back to the birthday calendar"
          className="bday-paw flex cursor-pointer items-center gap-2 rounded-full border-2 border-[color:var(--bday-coffee)]/15 bg-[color:var(--bday-paper)]/90 px-5 py-1.5 shadow-[0_3px_0_rgba(91,66,50,0.12),0_8px_20px_rgba(91,66,50,0.12)] backdrop-blur-sm transition-transform active:scale-95"
        >
          <DoodleBow size={22} className="text-[color:var(--bday-rose)]" />
          <span className="bday-hand text-xl leading-none text-[color:var(--bday-cocoa)]">
            {JOURNEY.title}
          </span>
          {day && (
            <span className="bday-scrawl ml-1 rounded-full bg-[color:var(--bday-blush-soft)] px-2 py-0.5 text-xs text-[color:var(--bday-rose-deep)]">
              day {day}
            </span>
          )}
          <DoodleHeart size={18} className="text-[color:var(--bday-blush)]" />
        </button>
      </motion.header>

      {/* ── soft page transition ────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <RunningCatCameo />
      <BgmToggle on={bgmOn} onToggle={toggleBgm} />
    </>
  );
}

/** Floating music note button — bottom-right, always reachable. */
function BgmToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const spinning = on;
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={on ? "Pause the music" : "Play the music"}
      className="bday-paw fixed bottom-4 right-4 z-40 grid h-14 w-14 place-items-center rounded-full border-2 border-[color:var(--bday-coffee)]/20 bg-[color:var(--bday-paper)]/95 shadow-[0_4px_0_rgba(91,66,50,0.15),0_10px_24px_rgba(91,66,50,0.18)] backdrop-blur-sm active:scale-95"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { repeat: Infinity, duration: 4, ease: "linear" } : {}}
      >
        {/* music note */}
        <path
          d="M9 18.5a3 3 0 1 1-2-2.83V6.5l11-2.3v3.1L10.5 9.3v8.2"
          fill="none"
          stroke="var(--bday-cocoa)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="18" r="2.4" fill="var(--bday-rose)" />
        <circle cx="18" cy="6.5" r="2.4" fill="var(--bday-rose)" />
      </motion.svg>
      {!on && (
        <span
          className="absolute h-full w-full rounded-full border-2 border-dashed border-[color:var(--bday-coffee)]/25"
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}

/** A tiny Mochi sprints across the bottom every ~45s. Pure delight. */
function RunningCatCameo() {
  const [run, setRun] = useState(0);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    if (reduced) return;
    const i = setInterval(() => setRun((n) => n + 1), 45000);
    return () => clearInterval(i);
  }, [reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div
          key={run}
          className="pointer-events-none fixed bottom-1 left-0 z-30"
          initial={{ x: "-12vw" }}
          animate={{ x: "112vw" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 9, ease: "linear" }}
          onAnimationComplete={() => setRun(0)}
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <svg viewBox="10 5 60 55" width="52" height="48">
              {/* mini running cat: stretched body + tail up */}
              <path d="M52 12 q10 -6 12 -14" stroke="#3f2d22" strokeWidth="5" fill="none" strokeLinecap="round" />
              <ellipse cx="34" cy="34" rx="22" ry="13" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2.2" />
              <circle cx="56" cy="24" r="11" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2.2" />
              <path d="M50 16 L48 7 L56 12 Z" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="1.8" />
              <path d="M62 16 L64 7 L56 12 Z" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="1.8" />
              <circle cx="58" cy="23" r="1.4" fill="#3f2d22" />
              <circle cx="63" cy="23" r="1.4" fill="#3f2d22" />
              {/* running legs */}
              <motion.g
                animate={{ rotate: [18, -18] }}
                transition={{ repeat: Infinity, duration: 0.3, repeatType: "mirror" }}
                style={{ originX: "30px", originY: "44px" }}
              >
                <path d="M22 44 l-5 9 M30 46 l0 10 M40 44 l6 9" stroke="#3f2d22" strokeWidth="3.4" strokeLinecap="round" />
              </motion.g>
              <path d="M34 46 l-4 9 M44 46 l3 9" stroke="#3f2d22" strokeWidth="3.4" strokeLinecap="round" opacity="0.6" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(true); // SSR-safe: no animation first
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
