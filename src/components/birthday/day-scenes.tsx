"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirthdayCat } from "./BirthdayCat";
import {
  Burst,
  FloatingPetals,
  RisingParticles,
  useReducedMotion,
} from "./effects";
import { LETTERS, MEMORIES, type DayConfig } from "@/lib/birthday/config";
import { PolaroidImage } from "./PolaroidImage";
import { DoodleHeart, DoodleSparkle, DoodleStar } from "./doodles";

/**
 * Interactive day scenes — every important object runs a short
 * choreographed sequence: tap → object reacts → particles → reveal.
 * Reduced-motion users get each step's end-state immediately.
 */

interface SceneProps {
  day: DayConfig;
}

/* ── shared scene shell ───────────────────────────────────────── */
function Stage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex min-h-[300px] items-end justify-center pb-4 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="bday-scrawl mt-2 text-center text-[15px] opacity-60">
      {children}
    </p>
  );
}

/** Click-to-reveal message card used by most scenes. */
function RevealMessage({
  show,
  children,
  note,
}: {
  show: boolean;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="bday-paper-card bday-taped mt-4 w-full"
        >
          <p className="bday-message bday-hand text-center">{children}</p>
          {note && (
            <p className="bday-scrawl mt-2 text-center text-sm text-[color:var(--bday-rose-deep)]">
              {note}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small floating heart that pops from a spot and drifts up. */
function FloatHeart({ delay = 0, size = 18 }: { delay?: number; size?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute"
      initial={{ opacity: 0, y: 8, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -46, scale: [0.5, 1.1, 1, 0.8] }}
      transition={{ duration: 1.8, delay, ease: "easeOut" }}
    >
      <DoodleHeart size={size} className="text-[color:var(--bday-rose)]" />
    </motion.span>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 1 — FLOWERS
   tap → cat reacts → bouquet grows → petals → hearts →
   background brightens → message → handwritten "for you ♡"
   ══════════════════════════════════════════════════════════════ */
export function FlowersScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 tapped, 2 grown, 3 revealed
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    if (step > 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++idRef.current;
    setBursts((b) => [...b, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setStep(1);
    setTimeout(() => setStep(2), 250);
  }

  return (
    <div onClick={handleTap} className="cursor-pointer select-none">
      {/* background brightens softly after the tap */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl"
        animate={step >= 1 ? { backgroundColor: "rgba(246,220,200,0.35)" } : {}}
        transition={{ duration: 1 }}
      />
      <FloatingPetals count={step >= 2 ? 12 : 5} />

      <Stage>
        {bursts.map((b) => (
          <Burst key={b.id} x={b.x} y={b.y - 120} count={9} hearts />
        ))}
        <motion.div
          animate={
            step >= 1
              ? { scale: [1, 1.12, 1.07], rotate: [0, -2, 1, 0] }
              : {}
          }
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10"
        >
          <BirthdayCat
            pose="carry-bouquet"
            size={190}
            className={step >= 1 ? "" : "bday-float"}
          />
          {/* cat happiness: tiny bounce + closed happy eyes overlay via heart */}
          {step >= 1 && <FloatHeart delay={0.4} size={20} />}
          {step >= 1 && <FloatHeart delay={0.9} size={14} />}
          {step >= 2 && <FloatHeart delay={0.2} size={16} />}
        </motion.div>
      </Stage>

      <Hint>{step === 0 ? "tap the bouquet..." : "for you ♡"}</Hint>

      <AnimatePresence>
        {step >= 2 && (
          <motion.p
            initial={{ opacity: 0, rotate: -6, scale: 0.6 }}
            animate={{ opacity: 1, rotate: -3, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }}
            className="bday-hand pointer-events-none -mt-8 text-center text-2xl text-[color:var(--bday-rose-deep)]"
          >
            for you ♡
          </motion.p>
        )}
      </AnimatePresence>

      <RevealMessage show={step >= 2} note={day.note}>
        {day.message}
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 2 — CHOCOLATES
   tap → wiggle → ribbon loosens → lid opens → chocolates pop →
   particles rise → cat excited → message
   ══════════════════════════════════════════════════════════════ */
export function ChocolatesScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 wiggle, 2 ribbon, 3 lid+pop
  const reduced = useReducedMotion();

  function tap() {
    if (step > 0) return;
    setStep(1);
    const delays = reduced ? [0, 0] : [450, 1000];
    setTimeout(() => setStep(2), delays[0]);
    setTimeout(() => setStep(3), delays[1]);
  }

  return (
    <div className="select-none">
      <Stage>
        <div
          className="relative z-10 cursor-pointer"
          onClick={tap}
          role="button"
          aria-label="Open the chocolate box"
        >
          <motion.div
            animate={step === 1 ? { rotate: [0, -3, 3, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <BirthdayCat pose="carry-box" size={180} className={step >= 3 ? "" : "bday-float"} />
          </motion.div>

          {/* ribbon loosens */}
          <motion.div
            className="absolute left-1/2 top-6 -ml-1 w-2 rounded bg-[color:var(--bday-blush)]"
            animate={
              step >= 2
                ? { rotate: 24, y: -18, opacity: [1, 1, 0] }
                : { rotate: 0, y: 0, opacity: 1 }
            }
            transition={{ duration: 0.6 }}
          />

          {/* lid springs open */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: -76, rotate: -16 }}
                transition={{ type: "spring", stiffness: 150, damping: 13 }}
                className="absolute left-1/2 top-2 -ml-14 h-4 w-28 rounded-md bg-[#a06a48] shadow-md"
              />
            )}
          </AnimatePresence>

          {/* chocolates pop up */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 26, scale: 0.6 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.18 }}
                className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1"
              >
                {["#8a5a3c", "#a06a48", "#6d452c", "#8a5a3c"].map((c, i) => (
                  <motion.span
                    key={i}
                    animate={reduced ? {} : { y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    className="block h-5 w-5 rounded"
                    style={{ background: c, border: "2px solid #5b4232" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* cat excited: exclamation + happy hearts */}
          {step >= 3 && (
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 10 }}
              className="bday-scrawl absolute -right-4 top-0 text-xl text-[color:var(--bday-rose-deep)]"
            >
              !
            </motion.span>
          )}
          {step >= 3 && <RisingParticles x={95} y={100} count={7} kind="choco" colors={["#8a5a3c", "#a06a48"]} />}
          {step >= 3 && <RisingParticles x={95} y={110} count={5} kind="heart" />}
        </div>
      </Stage>

      <Hint>
        {step === 0 ? "tap to open the box..." : step < 3 ? "just a second..." : "all yours ♡"}
      </Hint>
      <RevealMessage show={step >= 3} note={day.note}>
        {day.message}
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 3 — COFFEE
   tap → cup moves → steam rises → steam hearts → cat sips →
   sparkle → message; steam keeps drifting afterward
   ══════════════════════════════════════════════════════════════ */
export function CoffeeScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 tapped/steam, 2 sip, 3 sparkle
  const reduced = useReducedMotion();

  function tap() {
    if (step > 0) return;
    setStep(1);
    setTimeout(() => setStep(2), reduced ? 0 : 900);
    setTimeout(() => setStep(3), reduced ? 0 : 1800);
  }

  return (
    <div className="select-none">
      <Stage>
        <div className="relative z-10">
          {/* cat leans toward the mug on the sip step */}
          <motion.div
            animate={step >= 2 ? { rotate: [0, 6, 4], x: [0, 8, 6] } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <BirthdayCat pose="cafe" size={180} />
          </motion.div>

          <button
            onClick={tap}
            aria-label="Warm the coffee"
            className="absolute -left-16 bottom-2 grid h-24 w-24 place-items-center rounded-full transition-transform active:scale-95"
          >
            <motion.div
              animate={step === 1 ? { rotate: [0, -4, 4, -2, 0], y: [0, -3, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <svg viewBox="0 0 60 54" width="72" height="64">
                <path d="M10 18h34v14a14 14 0 0 1-14 14h-6A14 14 0 0 1 10 32V18Z" fill="#fbf6ec" stroke="#5b4232" strokeWidth="2.4" />
                <path d="M44 21h4.6a6 6 0 0 1 0 12H44" fill="none" stroke="#5b4232" strokeWidth="2.2" />
                <ellipse cx="27" cy="18" rx="16" ry="3.4" fill="#8a5a3c" stroke="#5b4232" strokeWidth="1.6" />
              </svg>
            </motion.div>

            {/* rising steam → hearts */}
            {step >= 1 && (
              <span aria-hidden="true" className="absolute -top-10 left-1/2 flex -translate-x-1/2 gap-2">
                {[0, 0.7, 1.4].map((d) => (
                  <motion.span
                    key={d}
                    className="block"
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={
                      step >= 2
                        ? { opacity: [0, 0.9, 0], y: -44, scale: [0.5, 1.1, 0.7] }
                        : { opacity: [0, 0.6, 0], y: -38, scaleX: [1, 1.5], scaleY: [1, 1.2] }
                    }
                    transition={
                      step >= 2
                        ? { repeat: Infinity, duration: 2.4, delay: d }
                        : { repeat: Infinity, duration: 2.6, delay: d }
                    }
                  >
                    {step >= 2 ? (
                      <DoodleHeart size={13} className="text-white/80" />
                    ) : (
                      <span className="block h-8 w-2 rounded-full bg-white/80 blur-[3px]" />
                    )}
                  </motion.span>
                ))}
              </span>
            )}

            {/* sparkle above the cup */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: [0, 1.25, 1], rotate: 0, opacity: [0, 1, 0.9] }}
                  transition={{ duration: 0.7 }}
                  className="absolute -top-16 left-1/2 -ml-3"
                >
                  <DoodleSparkle size={26} className="text-[color:var(--bday-gold)]" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </Stage>

      <Hint>{step >= 2 ? "just the way you like it ♡" : "tap the cup..."}</Hint>
      <RevealMessage show={step >= 2} note={day.note}>
        {day.message}
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 4 — PLUSHIE
   tap → plushie wiggles → cat walks over → hugs → hearts →
   one squeeze → message  (the cute one)
   ══════════════════════════════════════════════════════════════ */
export function PlushieScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 wiggle, 2 walk, 3 hug, 4 squeeze
  const reduced = useReducedMotion();
  const busy = step > 0; // spam guard: one run at a time

  function tap() {
    if (busy) return;
    setStep(1);
    const d = reduced ? [0, 0, 0] : [500, 1300, 2100];
    setTimeout(() => setStep(2), d[0]);
    setTimeout(() => setStep(3), d[1]);
    setTimeout(() => setStep(4), d[2]);
  }

  return (
    <div className="select-none">
      <Stage>
        <div className="relative z-10 flex w-full items-end justify-center">
          {/* the cat — walks from the left toward the plushie */}
          <motion.div
            className="origin-bottom"
            animate={
              step === 2
                ? { x: [0, 26, 30], rotate: [0, 2, -2, 0] } // little waddle
                : step >= 3
                  ? { x: 30 }
                  : { x: 0 }
            }
            transition={step === 2 ? { duration: 0.9, ease: "easeInOut" } : { duration: 0.4 }}
          >
            <motion.div
              animate={step >= 3 ? { rotate: [-2, 2, -2] } : {}}
              transition={step >= 3 ? { repeat: Infinity, duration: 1.6 } : {}}
            >
              <BirthdayCat pose={step >= 3 ? "hug-heart" : "sit"} size={150} />
            </motion.div>
            {step >= 3 && (
              <>
                <FloatHeart delay={0.1} size={18} />
                <FloatHeart delay={0.7} size={14} />
                <FloatHeart delay={1.3} size={20} />
                {/* tiny sparkles around the hug */}
                <motion.span
                  className="absolute -left-2 top-2"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: [0, 1.2, 1], rotate: 0, opacity: [0, 1, 0.8] }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                >
                  <DoodleSparkle size={18} className="text-[color:var(--bday-gold)]" />
                </motion.span>
                <motion.span
                  className="absolute -right-3 top-10"
                  initial={{ scale: 0, rotate: 30 }}
                  animate={{ scale: [0, 1.15, 1], rotate: 0, opacity: [0, 1, 0.75] }}
                  transition={{ delay: 0.8, duration: 0.7 }}
                >
                  <DoodleSparkle size={14} className="text-[color:var(--bday-rose)]" />
                </motion.span>
              </>
            )}
          </motion.div>

          {/* the bunny plushie — THE interactive object: whole area clickable,
              works with mouse + touch, guarded against spam-tapping */}
          <motion.button
            type="button"
            onClick={tap}
            onTouchStart={
              reduced
                ? undefined
                : (e) => {
                    e.preventDefault(); // stop the emulated click from double-firing
                    tap();
                  }
            }
            disabled={busy}
            aria-label="Tap the bunny"
            className="relative -ml-4 cursor-pointer rounded-full p-4 active:scale-95 transition-transform"
            style={{ WebkitTapHighlightColor: "transparent", minWidth: 96, minHeight: 116 }}
            animate={step === 1 ? { rotate: [0, -7, 7, -4, 0] } : step >= 3 ? { rotate: [-3, 3, -3] } : {}}
            transition={step === 1 ? { duration: 0.5 } : { repeat: Infinity, duration: 1.6 }}
          >
            <svg viewBox="0 0 60 70" width={86} height={100}>
              <ellipse cx="16" cy="12" rx="7" ry="12" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
              <ellipse cx="40" cy="12" rx="7" ry="12" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
              <ellipse cx="16" cy="14" rx="3" ry="7" fill="#eec6c0" />
              <ellipse cx="40" cy="14" rx="3" ry="7" fill="#eec6c0" />
              <ellipse cx="28" cy="42" rx="24" ry="24" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
              <circle cx="20" cy="38" r="2.6" fill="#3f2d22" />
              <circle cx="36" cy="38" r="2.6" fill="#3f2d22" />
              <path d="M24 46 q4 4 8 0" stroke="#3f2d22" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="16" cy="45" rx="4" ry="2.4" fill="#e896a0" opacity="0.5" />
              <ellipse cx="40" cy="45" rx="4" ry="2.4" fill="#e896a0" opacity="0.5" />
            </svg>
            {/* floating affordance hint before the first tap */}
            {step === 0 && (
              <motion.span
                className="bday-scrawl absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-[color:var(--bday-rose-deep)]"
                animate={reduced ? {} : { y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              >
                tap the bunny ❤
              </motion.span>
            )}
          </motion.button>
        </div>
      </Stage>

      <Hint>
        {step === 0 ? "tap the bunny ❤" : step < 3 ? "here he comes..." : "hug accepted ♡"}
      </Hint>
      <RevealMessage show={step >= 3} note={day.note}>
        {day.message}
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 5 — GIFT
   tap → wiggle → ribbon bounce → ribbon loosens → lid lifts →
   confetti → cat hides → cat peeks → contents + message
   ══════════════════════════════════════════════════════════════ */
export function GiftScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 wiggle, 2 ribbon, 3 lid+confetti, 4 hide, 5 peek
  const reduced = useReducedMotion();
  const [burstKey, setBurstKey] = useState(0);

  function tap() {
    if (step > 0) return;
    setStep(1);
    const d = reduced ? [0, 0, 0, 0] : [500, 1000, 1500, 2600];
    setTimeout(() => setStep(2), d[0]);
    setTimeout(() => {
      setStep(3);
      setBurstKey((k) => k + 1);
    }, d[1]);
    setTimeout(() => setStep(4), d[2]);
    setTimeout(() => setStep(5), d[3]);
  }

  return (
    <div className="select-none">
      <Stage>
        <div
          className="relative z-10 cursor-pointer"
          onClick={tap}
          role="button"
          aria-label="Open the gift"
        >
          {/* cat: present → hides behind box → peeks out */}
          <motion.div
            className="absolute left-1/2 -ml-24 bottom-4 origin-bottom"
            animate={
              step >= 4
                ? step >= 5
                  ? { x: -46, y: 0, opacity: 1, scaleY: 1 } // peeking
                  : { x: -20, y: 26, opacity: 0, scaleY: 0.5 } // hiding
                : { x: 0, y: 0, opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 140, damping: 15 }}
          >
            <BirthdayCat pose={step >= 5 ? "sit" : "gift"} size={140} />
          </motion.div>

          {/* the box */}
          <motion.div
            className="relative ml-6"
            animate={step === 1 ? { rotate: [0, -3, 3, -2, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <svg viewBox="0 0 110 100" width={150} height={136}>
              {/* ribbon */}
              <motion.rect
                x="49" y="30" width="12" height="62" fill="#c9808a"
                animate={step >= 2 ? { rotate: 14, y: -20, opacity: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 }}
                style={{ originX: "55px", originY: "30px" }}
              />
              {/* lid */}
              <motion.g
                animate={step >= 3 ? { y: -46, rotate: -14, opacity: 0.35 } : {}}
                transition={{ type: "spring", stiffness: 130, damping: 12, delay: 0.35 }}
                style={{ originX: "55px", originY: "30px" }}
              >
                <rect x="20" y="18" width="70" height="14" rx="3" fill="#e8b7b7" stroke="#c9808a" strokeWidth="2.2" />
                <motion.path
                  d="M55 18c-8 0-12.6-4.4-11.2-8.6 1-3 7.2-1.8 11.2 8.6ZM55 18c8 0 12.6-4.4 11.2-8.6-1-3-7.2-1.8-11.2 8.6Z"
                  fill="#c9808a" stroke="#a75d68" strokeWidth="1.4"
                  animate={step === 2 ? { scale: [1, 1.35, 1], y: [0, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  style={{ originX: "55px", originY: "18px" }}
                />
              </motion.g>
              {/* body */}
              <rect x="26" y="32" width="58" height="60" rx="4" fill="#f7efe1" stroke="#c9808a" strokeWidth="2.2" />
            </svg>

            {/* confetti + contents */}
            {step >= 3 && burstKey > 0 && <Burst key={burstKey} x={80} y={70} count={14} />}
            <AnimatePresence>
              {step >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.7 }}
                  animate={{ opacity: 1, y: -14, scale: 1 }}
                  transition={{ type: "spring", stiffness: 160, damping: 12 }}
                  className="absolute left-1/2 top-10 -ml-4"
                >
                  <DoodleSparkle size={34} className="text-[color:var(--bday-gold)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </Stage>

      <Hint>
        {step === 0 ? "tap to open..." : step < 3 ? "ooh..." : step === 4 ? "wait, where did the cat go?" : "peek! ♡"}
      </Hint>
      <RevealMessage
        show={step >= 5}
        note={day.note}
      >
        {day.message}
        {/* CUSTOMIZE: the gift's inside — edit in config.ts (DAYS[4]) */}
        <span className="mt-2 block text-lg text-[color:var(--bday-rose-deep)]">
          inside: [your little gift here ♡]
        </span>
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 6 — LOVE LETTER
   tap → envelope to viewer → seal breaks → flap opens → letter
   slides out → unfolds → type-on text → hearts
   ══════════════════════════════════════════════════════════════ */
export function LetterScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 seal, 2 flap, 3 slide, 4 unfold, 5 text
  const reduced = useReducedMotion();
  const L = LETTERS.loveLetter;

  function tap() {
    if (step > 0) return;
    setStep(1);
    const d = reduced ? [0, 0, 0, 0] : [500, 1000, 1500, 1900];
    setTimeout(() => setStep(2), d[0]);
    setTimeout(() => setStep(3), d[1]);
    setTimeout(() => setStep(4), d[2]);
    setTimeout(() => setStep(5), d[3]);
  }

  return (
    <div className="select-none">
      <Stage className="!min-h-[260px]">
        {/* the envelope itself is the interactive object */}
        <div
          className="relative z-10 cursor-pointer"
          onClick={tap}
          role="button"
          aria-label="Open the love letter"
        >
          <motion.div
            animate={step >= 1 ? { scale: [1, 1.08, 1.05], y: [0, -8, -6] } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-36 w-56 sm:h-40 sm:w-64">
              {/* body */}
              <div className="absolute inset-0 rounded-lg bg-[color:var(--bday-paper)] shadow-lg" style={{ border: "2px solid rgba(91,66,50,.2)" }} />
              {/* flap — rotates open */}
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-lg"
                style={{
                  background: "var(--bday-cream-deep)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  backfaceVisibility: "hidden",
                }}
                animate={step >= 2 ? { rotateX: 170, opacity: step >= 3 ? 0.35 : 1 } : {}}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
              {/* wax seal — breaks and fades */}
              <AnimatePresence>
                {step < 2 && (
                  <motion.div
                    exit={{ scale: [1, 1.4, 0], opacity: [1, 1, 0], rotate: 30 }}
                    transition={{ duration: 0.45 }}
                    className="absolute left-1/2 top-1/2 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--bday-rose)] ring-4 ring-[color:var(--bday-rose-deep)]/30"
                  >
                    <DoodleHeart size={22} className="text-[#f7efe1]" />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* letter slides out of the envelope */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={step >= 4 ? { y: -74, opacity: 1 } : { y: -6, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 90, damping: 14 }}
                    className="absolute inset-x-4 top-2 rounded bg-[#fffdf8] shadow-md"
                    style={{ minHeight: 96, border: "1px solid rgba(91,66,50,.15)" }}
                  >
                    {step >= 5 && (
                      <div className="bday-letter-lines px-3 py-2">
                        <TypeOn text={L.greeting} className="bday-hand text-lg text-[color:var(--bday-rose-deep)]" />
                        <TypeOn text={L.paragraphs[0] ?? ""} className="mt-1 text-[13px] leading-5" delay={0.5} />
                        {step >= 5 && (
                          <span className="bday-scrawl block text-right text-xs text-[color:var(--bday-coffee-soft)]">
                            …tap to read the whole letter below ♡
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* hearts around the letter */}
          {step >= 4 && (
            <>
              <FloatHeart delay={0.2} size={16} />
              <FloatHeart delay={0.8} size={20} />
              <FloatHeart delay={1.4} size={14} />
            </>
          )}
          {/* the cat watches proudly from the side */}
          <div className="absolute -right-4 bottom-0 opacity-95 sm:-right-10">
            <BirthdayCat pose="deliver-letter" size={110} className={step >= 1 ? "" : "bday-float"} />
          </div>
        </div>
      </Stage>

      <Hint>{step === 0 ? "tap the envelope..." : "from me, to you ♡"}</Hint>

      {/* full unfolded letter */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bday-paper-card bday-taped bday-letter-lines mt-4 w-full"
          >
            <h3 className="bday-h2 mb-2">{day.heading}</h3>
            <p className="bday-hand text-xl">{L.greeting}</p>
            {L.paragraphs.map((p, i) => (
              <p key={i} className="mt-2">{p}</p>
            ))}
            <p className="bday-hand mt-4 text-right text-lg text-[color:var(--bday-rose-deep)]">
              {L.closing}
              <span className="bday-scrawl ml-2 text-base text-[color:var(--bday-coffee-soft)]">
                {L.signature}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Soft type-on reveal — quick, never painfully slow. */
function TypeOn({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={`block ${className ?? ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden={i > 0 ? "true" : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: delay + i * 0.018 }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 8 — MEMORY
   tap → polaroid lifts off the page → background dims → expands
   into a scrapbook lightbox → sparkles → caption fades in
   ══════════════════════════════════════════════════════════════ */
export function MemoryScene({ day }: SceneProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="select-none">
      <h3 className="bday-h2 mb-1 text-center">{MEMORIES.heading}</h3>
      <Hint>tap a photo to look closer ♡</Hint>
      <div className="mt-6 flex flex-wrap items-start justify-center gap-5">
        {MEMORIES.photos.map((photo, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            onClick={() => setOpenIdx(i)}
            className="bday-polaroid w-36 sm:w-44"
            style={{ rotate: photo.tilt ?? 0 }}
            whileHover={{ y: -8, rotate: 0, scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Open photo: ${photo.caption}`}
          >
            <PolaroidImage photo={photo} />
            <p className="bday-scrawl mt-2 break-words text-center text-sm text-[color:var(--bday-coffee)]">
              {photo.caption}
            </p>
            {photo.date && (
              <p className="bday-scrawl text-center text-xs opacity-55">{photo.date}</p>
            )}
          </motion.button>
        ))}
      </div>

      <RevealMessage show={true}>{day.message}</RevealMessage>

      {/* lightbox: photo lifts off the page, background dims */}
      <AnimatePresence>
        {openIdx !== null && MEMORIES.photos[openIdx] && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(63,45,34,.6)] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIdx(null)}
          >
            <motion.figure
              className="bday-polaroid relative w-72 sm:w-80"
              initial={{ scale: 0.55, y: 60, rotate: (MEMORIES.photos[openIdx].tilt ?? 0) * 3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.55, y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* tape visually lifts with the photo */}
              <motion.span
                className="absolute -top-3 left-1/2 -ml-8 h-6 w-16 -translate-x-1/2"
                style={{
                  background: "repeating-linear-gradient(135deg, rgba(240,220,192,.95), rgba(240,220,192,.95) 6px, rgba(233,208,173,.9) 6px, rgba(233,208,173,.9) 12px)",
                  borderRadius: 2,
                }}
                initial={{ y: 0, rotate: -3 }}
                animate={{ y: -4, rotate: -6 }}
                transition={{ delay: 0.25 }}
              />
              <PolaroidImage photo={MEMORIES.photos[openIdx]} className="max-h-[55vh] w-full rounded-sm object-cover" />
              <motion.figcaption
                className="bday-hand mt-3 text-center text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {MEMORIES.photos[openIdx].caption}
                {MEMORIES.photos[openIdx].date && (
                  <span className="bday-scrawl ml-2 text-sm opacity-55">
                    · {MEMORIES.photos[openIdx].date}
                  </span>
                )}
              </motion.figcaption>
              {/* sparkles + one floating heart */}
              <motion.span
                className="absolute -right-3 -top-3"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.3 }}
              >
                <DoodleSparkle size={26} className="text-[color:var(--bday-gold)]" />
              </motion.span>
              <motion.span
                className="absolute -bottom-4 left-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: [0, 1, 1, 0], y: -26 }}
                transition={{ duration: 2, delay: 0.5 }}
              >
                <DoodleHeart size={18} className="text-[color:var(--bday-rose)]" />
              </motion.span>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 9 — HEART
   tap → pulse → screen zooms → two beats → heart swarm → cat hugs
   ══════════════════════════════════════════════════════════════ */
export function HeartScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 pulse, 2 beats, 3 swarm+hug
  const reduced = useReducedMotion();

  function tap() {
    if (step > 0) return;
    setStep(1);
    setTimeout(() => setStep(2), reduced ? 0 : 500);
    setTimeout(() => setStep(3), reduced ? 0 : 1500);
  }

  return (
    <div className="select-none">
      <FloatingPetals count={step >= 3 ? 14 : 6} hearts />
      <Stage>
        <motion.div
          className="relative z-10 cursor-pointer"
          onClick={tap}
          role="button"
          aria-label="Hug the heart"
          animate={
            step === 0
              ? { scale: [1, 1.04, 1] }
              : step === 1
                ? { scale: [1, 1.14, 1.06] }
                : step === 2
                  ? { scale: [1, 1.18, 1.02, 1.16, 1.04] }
                  : { scale: 1.02 }
          }
          transition={
            step === 0
              ? { repeat: Infinity, duration: 2.4 }
              : step === 2
                ? { duration: 1 }
              : { duration: 0.5 }
          }
        >
          <BirthdayCat pose="hug-heart" size={195} />
        </motion.div>

        {/* heart swarm */}
        {step >= 3 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2"
                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.3, 1, 1, 0.7],
                  x: Math.cos((i / 12) * Math.PI * 2) * (90 + (i % 3) * 40),
                  y: Math.sin((i / 12) * Math.PI * 2) * (70 + (i % 4) * 30) - 30,
                }}
                transition={{ duration: 2.2, delay: i * 0.08, ease: "easeOut" }}
              >
                <DoodleHeart
                  size={14 + (i % 3) * 6}
                  className={i % 2 ? "text-[color:var(--bday-rose)]" : "text-[color:var(--bday-blush)]"}
                />
              </motion.span>
            ))}
          </div>
        )}
      </Stage>

      <Hint>{step === 0 ? "tap the heart..." : "can you feel it? ♡"}</Hint>
      <RevealMessage show={step >= 2} note={day.note}>
        {day.message}
      </RevealMessage>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DAY 10 — MYSTERY (the box refuses)
   tap → wiggle → ribbon lifts → cat tries → refused → dots →
   cat looks at you → one sparkle → "Not this one... not yet. ♡"
   ══════════════════════════════════════════════════════════════ */
export function MysteryScene({ day }: SceneProps) {
  const [step, setStep] = useState(0); // 1 wiggle, 2 try, 3 refuse, 4 dots, 5 look+sparkle
  const reduced = useReducedMotion();

  function tap() {
    if (step > 0) return;
    setStep(1);
    const d = reduced ? [0, 0, 0, 0] : [500, 1100, 1900, 2500];
    setTimeout(() => setStep(2), d[0]);
    setTimeout(() => setStep(3), d[1]);
    setTimeout(() => setStep(4), d[2]);
    setTimeout(() => setStep(5), d[3]);
  }

  return (
    <div className="select-none">
      <Stage>
        <div className="relative z-10 cursor-pointer" onClick={tap} role="button" aria-label="Try the mystery box">
          {/* the box, with a ribbon that lifts hopefully */}
          <motion.div
            animate={step === 1 ? { rotate: [0, -4, 4, -2, 0] } : step >= 2 ? { y: [0, -5, 0] } : {}}
            transition={step === 1 ? { duration: 0.5 } : { duration: 0.7 }}
            className="relative ml-16"
          >
            <svg viewBox="0 0 110 100" width={150} height={136}>
              <rect x="20" y="30" width="70" height="60" rx="4" fill="#f7efe1" stroke="#c9808a" strokeWidth="2.2" />
              <motion.path
                d="M55 30 V90" stroke="#c9808a" strokeWidth="10"
                animate={step >= 2 ? { pathLength: 1 } : {}}
              />
              <motion.path
                d="M55 30c-8 0-12.6-4.4-11.2-8.6 1-3 7.2-1.8 11.2 8.6ZM55 30c8 0 12.6-4.4 11.2-8.6-1-3-7.2-1.8-11.2 8.6Z"
                fill="#c9808a" stroke="#a75d68" strokeWidth="1.4"
                animate={step >= 2 && step < 4 ? { y: [0, -8, -3] } : {}}
                transition={{ duration: 0.6 }}
              />
              {/* the single tiny sparkle when it refuses */}
              <AnimatePresence>
                {step >= 5 && (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.85] }}
                    transition={{ duration: 0.6 }}
                    style={{ originX: "55px", originY: "60px" }}
                  >
                    <path d="M55 52c.8 4 2.6 5.6 6.6 6-4 .8-5.8 2.4-6.6 6.4-.8-4-2.6-5.6-6.6-6.4 4-.4 5.8-2 6.6-6Z" fill="#d9b36c" />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </motion.div>

          {/* the cat: tries → confused → looks at you */}
          <motion.div
            className="absolute bottom-2 left-2 origin-bottom"
            animate={
              step >= 2
                ? step >= 3
                  ? { x: 14, rotate: [0, -6, 0] } // tried, bounced back
                  : { x: 14 }
                : { x: 0 }
            }
            transition={{ duration: 0.5 }}
          >
            <BirthdayCat pose={step >= 3 ? "sit" : "mystery"} size={130} />
          </motion.div>

          {/* tiny "..." */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ duration: 1.2 }}
                className="bday-hand absolute -top-2 left-24 text-2xl text-[color:var(--bday-coffee-soft)]"
              >
                ...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Stage>

      <Hint>{step === 0 ? "tap the box (it won't open)..." : ""}</Hint>

      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bday-paper-card bday-taped mt-4 w-full"
          >
            <p className="bday-message bday-hand text-center text-xl text-[color:var(--bday-rose-deep)]">
              Not this one... not yet. ♡
            </p>
            <p className="bday-message mt-2 text-center opacity-80">{day.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
