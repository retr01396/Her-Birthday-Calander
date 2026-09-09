"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirthdayCat } from "./BirthdayCat";
import { Burst, FloatingPetals, useReducedMotion } from "./effects";
import { ROSE_CINEMATIC, type DayConfig } from "@/lib/birthday/config";
import { DoodleHeart, DoodleStar, DoodleSparkle } from "./doodles";

/* ══════════════════════════════════════════════════════════════
   DAY 7 — ROSES: the mini cinematic
   idle → dim → near-black + "wait..." → sparkle → GIANT bouquet
   + petal explosion → hold → crossfade: dark layer fades away while
   the final page state (cat proudly presenting the bouquet) fades in
   ══════════════════════════════════════════════════════════════ */

type RosePhase =
  | "idle"
  | "dim"
  | "wait"
  | "sparkle"
  | "bouquet"
  | "settle" // bouquet alone on black, held briefly
  | "reveal"; // crossfade to cream + cat presenting

export function RoseCinematicScene({ day }: { day: DayConfig }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<RosePhase>("idle");
  const [petalBurst, setPetalBurst] = useState(0);
  const running = useRef(false);

  function startCinematic() {
    if (running.current || phase !== "idle") return;
    running.current = true;
    setPhase("dim");
  }

  useEffect(() => {
    if (phase === "idle") return;
    if (reduced) {
      // reduced motion: skip straight to the final presented state
      setPhase("reveal");
      return;
    }
    const t: ReturnType<typeof setTimeout>[] = [];
    switch (phase) {
      case "dim":
        t.push(setTimeout(() => setPhase("wait"), 750));
        break;
      case "wait":
        t.push(setTimeout(() => setPhase("sparkle"), 1500));
        break;
      case "sparkle":
        t.push(
          setTimeout(() => {
            setPhase("bouquet");
            setPetalBurst((b) => b + 1);
          }, 950)
        );
        break;
      case "bouquet":
        t.push(setTimeout(() => setPhase("settle"), 1400)); // hold the bouquet
        break;
      case "settle":
        t.push(setTimeout(() => setPhase("reveal"), 900)); // gentle crossfade
        break;
    }
    return () => t.forEach(clearTimeout);
  }, [phase, reduced]);

  const dark = phase === "dim" || phase === "wait" || phase === "sparkle" || phase === "bouquet" || phase === "settle";
  const showCinematicBouquet = phase === "bouquet" || phase === "settle" || phase === "reveal";
  const finale = phase === "reveal";

  return (
    <div className="relative select-none">
      {/* ═══ CINEMATIC LAYER (dark) ═══ */}
      <AnimatePresence>
        {dark && (
          <motion.div
            key="dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "dim" ? 0.94 : 1 }}
            exit={{ opacity: 0, transition: { duration: 1.1, ease: "easeInOut" } }}
            className="fixed inset-0 z-40"
            style={{
              background: "radial-gradient(ellipse at center, #2e2320 0%, #171110 78%)",
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </AnimatePresence>

      {/* "wait..." */}
      <AnimatePresence>
        {phase === "wait" && (
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.35em" }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.35 } }}
            transition={{ duration: 0.9 }}
            className="bday-hand fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-xl text-[#d8c4a8]"
          >
            {ROSE_CINEMATIC.wait}
          </motion.p>
        )}
      </AnimatePresence>

      {/* lone sparkle in the dark */}
      <AnimatePresence>
        {phase === "sparkle" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.1], opacity: 1 }}
            exit={{ opacity: 0, scale: 1.8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.7 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          >
            <DoodleSparkle size={36} className="text-[#e9d9a6]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ GIANT BOUQUET — lives in BOTH layers for a seamless crossfade.
            Rendered identically in the dark layer and the final page state,
            so when the dark layer fades away the bouquet never jumps. ═══ */}
      <AnimatePresence>
        {showCinematicBouquet && (
          <motion.div
            key={finale ? "bouquet-final" : "bouquet-dark"}
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
            transition={{
              // overshoot via spring physics (0.55 → ~1.1 → settle at 1.0)
              // without multi-keyframe arrays, which spring doesn't support
              scale: { type: "spring", stiffness: 170, damping: 9, mass: 0.9 },
              opacity: { duration: 0.35, ease: "easeOut" },
            }}
            className={
              finale
                ? "pointer-events-none relative z-10 flex items-end justify-center"
                : "fixed inset-0 z-50 flex items-center justify-center"
            }
          >
            {/* warm halo — only during the dark phase */}
            {!finale && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                transition={{ delay: 0.25 }}
                className="absolute h-[72vmin] w-[72vmin] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(246,220,200,.55), transparent 70%)" }}
              />
            )}
            <GiantRoseBouquet />
            {/* petal/heart explosion at the moment of appearance */}
            {!finale && petalBurst > 0 && (
              <Burst key={petalBurst} x={0} y={0} count={18} hearts />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* after-line while the bouquet still owns the screen */}
      <AnimatePresence>
        {(phase === "settle" || phase === "reveal") && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: finale ? 1 : 0.95, y: 0 }}
            transition={{ delay: phase === "settle" ? 0.2 : 0.6, duration: 0.6 }}
            className={
              finale
                ? "bday-hand relative z-10 -mt-2 text-center text-2xl text-[color:var(--bday-rose-deep)]"
                : "bday-hand fixed inset-x-0 bottom-[16%] z-50 px-6 text-center text-2xl text-[#e8c9b8]"
            }
          >
            {ROSE_CINEMATIC.after}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ═══ THE PAGE STATE ═══ */}
      {/* Before the reveal: the normal little scene (fades out under the dark).
          After the reveal: cat proudly presenting the giant bouquet. */}
      <motion.div
        animate={{
          opacity: dark && !finale ? 0 : 1,
          scale: dark && !finale ? 0.97 : 1,
        }}
        transition={{ duration: finale ? 1 : 0.6, ease: "easeInOut" }}
        aria-hidden={dark && !finale}
      >
        <FloatingPetals count={finale ? 14 : 8} />
        <div className="relative flex min-h-[300px] items-end justify-center pb-4">
          {!finale ? (
            /* idle: just the cat with small roses — NO giant bouquet */
            <motion.button
              type="button"
              onClick={startCinematic}
              onTouchStart={
                reduced
                  ? undefined
                  : (e) => {
                      e.preventDefault();
                      startCinematic();
                    }
              }
              disabled={phase !== "idle"}
              aria-label="Receive the roses"
              whileTap={{ scale: 0.96 }}
              className="bday-paw relative z-10 cursor-pointer rounded-full p-4"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <BirthdayCat pose="roses" size={185} className="bday-float" />
              <motion.span
                className="bday-scrawl absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-[color:var(--bday-rose-deep)]"
                animate={reduced ? {} : { y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              >
                tap the roses ♡
              </motion.span>
            </motion.button>
          ) : (
            /* finale: cat standing proudly BESIDE the presented bouquet */
            <div className="relative z-10 flex items-end justify-center">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 90, damping: 12 }}
              >
                <BirthdayCat pose="roses" size={170} className="bday-float" />
              </motion.div>
              {/* little hearts popping around the proud cat */}
              {[0.5, 1.1, 1.7].map((d, i) => (
                <motion.span
                  key={i}
                  className="absolute"
                  style={{ left: `${34 + i * 6}%`, bottom: `${50 + i * 9}%` }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0.9, 0], y: -22 }}
                  transition={{ delay: d, duration: 1.6 }}
                >
                  <DoodleHeart size={14 + i * 4} className="text-[color:var(--bday-rose)]" />
                </motion.span>
              ))}
            </div>
          )}
        </div>

        <p className="bday-scrawl mt-2 text-center text-[15px] opacity-60">
          {finale ? "for you. all of them. ♡" : "some flowers deserve a little drama..."}
        </p>

        {/* the day's real message — only after the full reveal */}
        <AnimatePresence>
          {finale && (
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <div className="bday-paper-card bday-taped mt-4 w-full">
                <p className="bday-message bday-hand text-center">{day.message}</p>
                {day.note && (
                  <p className="bday-scrawl mt-2 text-center text-sm text-[color:var(--bday-rose-deep)]">
                    {day.note}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* overflow guard so the fixed cinematic layers never create scrollbars */}
      <style jsx>{`
        :global(body) {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

/* ── the big hand-drawn bouquet ───────────────────────────────── */
export function GiantRoseBouquet({ compact = false }: { compact?: boolean }) {
  const roses = [
    { x: -34, y: -30, s: 1 },
    { x: 0, y: -44, s: 1.15 },
    { x: 34, y: -30, s: 1 },
    { x: -17, y: -12, s: 0.9 },
    { x: 17, y: -12, s: 0.9 },
    { x: 0, y: -6, s: 1.05 },
  ];
  return (
    <svg
      viewBox="-70 -80 140 150"
      width={compact ? 190 : "min(72vw, 360px)"}
      className={compact ? "" : "drop-shadow-2xl"}
    >
      <g fill="#a8b79a" stroke="#7d8f6e" strokeWidth="1.6">
        <path d="M-26 30 q-26 6 -34 26 q22 4 34 -12 Z" />
        <path d="M26 30 q26 6 34 26 q-22 4 -34 -12 Z" />
        <path d="M0 40 q-4 24 -14 34 q16 2 20 -18 Z" />
        <path d="M-14 34 q-16 18 -12 34 q14 -4 18 -22 Z" opacity="0.8" />
        <path d="M14 34 q16 18 12 34 q-14 -4 -18 -22 Z" opacity="0.8" />
      </g>
      <g stroke="#7d8f6e" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M-34 -20 q-4 26 -10 44" />
        <path d="M0 -32 q0 30 0 56" />
        <path d="M34 -20 q4 26 10 44" />
        <path d="M-17 -6 q-6 24 -8 44" />
        <path d="M17 -6 q6 24 8 44" />
      </g>
      {roses.map((r, i) => (
        <g key={i} transform={`translate(${r.x} ${r.y}) scale(${r.s})`}>
          <circle r="16" fill="#d98a94" stroke="#a75d68" strokeWidth="2.2" />
          <circle r="11" fill="#e8a3ab" stroke="#a75d68" strokeWidth="1.4" />
          <circle r="6" fill="#f3c1c6" stroke="#a75d68" strokeWidth="1.2" />
          <path d="M-11 -4 q5 -7 11 -3 M4 -10 q6 2 6 8 M-6 8 q6 3 10 -1" stroke="#a75d68" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d="M-22 34 q22 14 44 0" stroke="#e8b7b7" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-8 38 c-9 -2 -13 -8 -11 -12 2 -3 8 -1 11 12 Z M8 38 c9 -2 13 -8 11 -12 -2 -3 -8 -1 -11 12 Z" fill="#e8b7b7" stroke="#c9808a" strokeWidth="1.6" />
      <g fill="#e8b7b7" opacity="0.85">
        <path d="M-52 -44 q-4 -7 2 -9 q5 -1 5 5 q0 -6 5 -5 q6 2 2 9 q-4 6 -7 9 q-3 -3 -7 -9Z" transform="scale(.7)" />
        <path d="M52 -44 q-4 -7 2 -9 q5 -1 5 5 q0 -6 5 -5 q6 2 2 9 q-4 6 -7 9 q-3 -3 -7 -9Z" transform="scale(.55)" />
      </g>
      <g fill="#e9d9a6">
        <path d="M-46 -58 c.6 3 2 4.4 5 5 -3 .6 -4.4 2 -5 5 -.6 -3 -2 -4.4 -5 -5 3 -.6 4.4 -2 5 -5Z" />
        <path d="M48 -60 c.6 3 2 4.4 5 5 -3 .6 -4.4 2 -5 5 -.6 -3 -2 -4.4 -5 -5 3 -.6 4.4 -2 5 -5Z" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 11 — MOON & STARS (unchanged behavior, kept here)
   ══════════════════════════════════════════════════════════════ */
export function MoonScene({ day }: { day: DayConfig }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [burstKey, setBurstKey] = useState(0);

  function tap() {
    if (step > 0) return;
    setStep(1);
    const d = reduced ? [0, 0, 0, 0] : [900, 1600, 2600, 3200];
    setTimeout(() => setStep(2), d[0]);
    setTimeout(() => {
      setStep(3);
      setBurstKey((k) => k + 1);
    }, d[1]);
    setTimeout(() => setStep(4), d[2]);
    setTimeout(() => setStep(5), d[3]);
  }

  const stars = [
    { l: "14%", t: "14%", s: 13 },
    { l: "34%", t: "8%", s: 10 },
    { l: "58%", t: "6%", s: 15 },
    { l: "80%", t: "14%", s: 11 },
    { l: "88%", t: "34%", s: 9 },
    { l: "24%", t: "30%", s: 8 },
    { l: "72%", t: "36%", s: 12 },
    { l: "46%", t: "22%", s: 8 },
  ];

  const constellation = "M20 44 C22 34 34 32 38 40 C40 34 50 34 50 42 C50 52 36 58 29 62 C24 56 18 50 20 44 Z";

  return (
    <div className="select-none">
      <motion.div
        className="relative cursor-pointer overflow-hidden rounded-2xl px-4 pb-2 pt-12 shadow-inner"
        onClick={tap}
        role="button"
        aria-label="Tap the sky"
        animate={{
          background:
            step === 0
              ? "linear-gradient(180deg, #b8a4c4 0%, #d8c3b4 100%)"
              : "linear-gradient(180deg, #3d3450 0%, #241f33 100%)",
        }}
        transition={{ duration: reduced ? 0 : 1.4, ease: "easeInOut" }}
      >
        {step >= 2 &&
          stars.map((s, i) => (
            <motion.span
              key={i}
              className="absolute"
              style={{ left: s.l, top: s.t }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
              transition={{ delay: i * 0.22, duration: 0.6 }}
            >
              <DoodleStar size={s.s} className="bday-twinkle text-[#e9d9a6]" style={{ "--delay": `${i * 0.4}s` } as React.CSSProperties} />
            </motion.span>
          ))}

        <motion.svg
          viewBox="0 0 80 80"
          className="absolute right-6 top-6 h-20 w-20"
          animate={
            step >= 3
              ? { scale: [1, 1.12, 1], filter: ["brightness(1)", "brightness(1.35)", "brightness(1.15)"] }
              : { opacity: step >= 1 ? 1 : 0.85 }
          }
          transition={{ duration: 1.2 }}
        >
          <path d="M52 8a30 30 0 1 0 20 30 22 22 0 0 1-20-30Z" fill="#e9d9a6" stroke="#d9b36c" strokeWidth="2" />
          {step >= 3 && (
            <motion.circle
              initial={{ opacity: 0.0, r: 26 }}
              animate={{ opacity: [0, 0.35, 0.22], r: 38 }}
              transition={{ duration: 1.4 }}
              cx="40" cy="40" fill="#e9d9a6"
            />
          )}
        </motion.svg>

        <AnimatePresence>
          {step >= 4 && (
            <motion.svg
              viewBox="0 0 70 70"
              className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.path
                d={constellation}
                fill="none"
                stroke="#e9d9a6"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="1 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0 : 1.6, ease: "easeInOut" }}
              />
              {step >= 5 && (
                <motion.path
                  d="M35 34 c-1.6-3-5-2-5 .8 0 2.4 2.6 4.4 5 6 2.4-1.6 5-3.6 5-6 0-2.8-3.4-3.8-5-.8Z"
                  fill="#e8b7b7"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.85], scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.svg>
          )}
        </AnimatePresence>

        <div className="relative flex min-h-[220px] items-end justify-center pb-2">
          <motion.div
            animate={step >= 3 ? { y: [0, -4, 0], rotate: [0, -2, 0] } : {}}
            transition={{ duration: 1.2 }}
          >
            <BirthdayCat pose="stargaze" size={140} />
          </motion.div>
        </div>
      </motion.div>

      <p className="bday-scrawl mt-2 text-center text-[15px] opacity-60">
        {step === 0 ? "tap the sky ♡" : step < 4 ? "look up..." : "did you make a wish? ♡"}
      </p>

      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bday-paper-card bday-taped mt-4 w-full"
          >
            <p className="bday-message bday-hand text-center">{day.message}</p>
            <p className="bday-scrawl mt-2 text-center text-sm text-[color:var(--bday-rose-deep)]">
              ☆ saved in the sky ☆ {day.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
