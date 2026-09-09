"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FINALE } from "@/lib/birthday/config";
import { BirthdayCat } from "./BirthdayCat";
import { Confetti, DoodleDivider, RisingParticles, useReducedMotion } from "./effects";
import {
  DoodleBalloon,
  DoodleBow,
  DoodleCake,
  DoodleFlower,
  DoodleGift,
  DoodleHeart,
  DoodleSparkle,
  DoodleStar,
} from "./doodles";

/**
 * DAY 13 — the birthday finale.
 * "You made it." → 3 · 2 · 1 (scene elements accumulate during the
 * countdown) → full reveal → interactive candles → Our Little World.
 */

type Phase = "opening" | "countdown" | "party";

export function BirthdayFinaleScene() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("opening");
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(
      () => setPhase(reduced ? "party" : "countdown"),
      reduced ? 1200 : 2200
    );
    return () => clearTimeout(t);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      setPhase("party");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  return (
    <div className="bday-center overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "opening" && (
          <motion.p
            key="opening"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.9 }}
            className="bday-h1"
          >
            {FINALE.opening}
          </motion.p>
        )}

        {phase === "countdown" && (
          <motion.div key={`count-${count}`} className="relative text-center">
            {/* elements quietly gather during the countdown */}
            {count <= 2 && (
              <>
                <motion.span initial={{ opacity: 0, y: -14 }} animate={{ opacity: 0.85, y: 0 }} className="absolute -top-10 left-2 sm:left-10">
                  <DoodleBalloon size={44} className="text-[color:var(--bday-rose)]" />
                </motion.span>
                <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.85, y: 0 }} transition={{ delay: 0.25 }} className="absolute -top-14 right-2 sm:right-10">
                  <DoodleBalloon size={36} className="text-[color:var(--bday-gold)]" />
                </motion.span>
              </>
            )}
            {count <= 1 && (
              <>
                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.9, scale: 1 }} className="absolute top-6 left-10">
                  <DoodleStar size={18} className="bday-twinkle text-[color:var(--bday-gold)]" />
                </motion.span>
                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.9, scale: 1 }} transition={{ delay: 0.2 }} className="absolute top-10 right-12">
                  <DoodleSparkle size={22} className="text-[color:var(--bday-rose)]" />
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.9, y: 0 }} transition={{ delay: 0.35 }} className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <BirthdayCat pose="sit" size={90} />
                </motion.span>
              </>
            )}
            <span className="bday-count-num bday-h1 inline-block !text-[6rem] leading-none text-[color:var(--bday-rose-deep)]">
              {count}
            </span>
          </motion.div>
        )}

        {phase === "party" && (
          <motion.div
            key="party"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bday-max"
            style={{ maxWidth: 560 }}
          >
            <Confetti count={reduced ? 0 : 70} />

            <div className="text-center">
              <motion.h1
                initial={{ scale: 0.8, rotate: -2 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.3 }}
                className="bday-h1 !text-[clamp(2.4rem,8vw,3.8rem)] text-[color:var(--bday-rose-deep)]"
              >
                {FINALE.headline}
              </motion.h1>
              <p className="bday-message mt-3 opacity-80">{FINALE.subheading}</p>
              <DoodleDivider className="my-5" />
            </div>

            {/* full illustrated birthday scene */}
            <div className="bday-paper-card bday-taped relative mt-6 overflow-hidden pt-8">
              {/* balloons drift in from the sides */}
              <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 60 }}>
                <DoodleBalloon size={54} className="bday-float absolute left-3 top-4 text-[color:var(--bday-rose)]" />
              </motion.div>
              <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.55, type: "spring", stiffness: 60 }}>
                <DoodleBalloon size={44} className="bday-float absolute right-4 top-8 text-[color:var(--bday-gold)]" style={{ animationDelay: "1.4s" }} />
              </motion.div>
              <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                <DoodleBalloon size={38} className="bday-float absolute left-16 top-12 text-[color:var(--bday-sage)]" style={{ animationDelay: "0.7s" }} />
              </motion.div>

              <DoodleStar size={20} className="bday-twinkle absolute right-14 top-6 text-[color:var(--bday-gold)]" />
              <DoodleSparkle size={26} className="bday-twinkle absolute left-8 top-24 text-[color:var(--bday-rose)]" style={{ animationDelay: "1s" }} />

              {/* the whole gang */}
              <div className="flex items-end justify-center gap-1">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 90 }}
                  className="bday-float"
                  style={{ animationDelay: "0.5s" }}
                >
                  <BirthdayCat pose="party" size={150} />
                </motion.div>
              </div>

              {/* giant cake — interactive candles */}
              <CakeInteractive />

              {/* gifts row bounces in */}
              <motion.div
                className="mt-2 flex items-end justify-center gap-4 pb-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
              >
                {[
                  <DoodleGift key="g1" size={40} className="text-[color:var(--bday-rose)]" />,
                  <DoodleFlower key="f1" size={34} className="text-[color:var(--bday-sage)]" />,
                  <DoodleBow key="b1" size={36} className="text-[color:var(--bday-rose-deep)]" />,
                  <DoodleFlower key="f2" size={30} className="text-[color:var(--bday-gold)]" />,
                  <DoodleGift key="g2" size={34} className="text-[color:var(--bday-rose)] -scale-x-100" />,
                ].map((el, i) => (
                  <motion.span
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 18, scale: 0.7 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    transition={{ type: "spring", stiffness: 160, damping: 12 }}
                  >
                    {el}
                  </motion.span>
                ))}
              </motion.div>

              <DoodleHeart size={18} className="bday-twinkle absolute bottom-6 right-6 text-[color:var(--bday-rose)]" />
            </div>

            <div className="mt-8 text-center">
              <motion.button
                className="bday-btn"
                onClick={() => router.push("/birthday/world")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {FINALE.enterWorld}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Interactive cake: tap → flames out, smoke rises, cat reacts, confetti + hearts. */
function CakeInteractive() {
  const [lit, setLit] = useState(true);
  const [celebrated, setCelebrated] = useState(0);
  const reduced = useReducedMotion();

  function blow() {
    if (!lit) return;
    setLit(false);
    setCelebrated((c) => c + 1);
  }

  return (
    <div className="relative mt-1 flex flex-col items-center">
      <button
        className="relative grid place-items-center rounded-xl px-6 py-2 transition-transform active:scale-95"
        onClick={blow}
        aria-label={lit ? "Blow out the birthday candles" : "Make a wish"}
      >
        <DoodleCake size={110} className="text-[color:var(--bday-coffee)]" />
        {/* candle flames */}
        {lit && (
          <span className="absolute left-1/2 top-1 -ml-2 flex gap-0">
            {[0, 7, 14].map((off, i) => (
              <span
                key={i}
                className={`absolute block rounded-full bg-[#f6c453] shadow-[0_0_10px_rgba(246,196,83,.9)] ${reduced ? "" : "bday-twinkle"}`}
                style={{ width: 8, height: 14, left: off - 12, animationDuration: "0.9s", animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
        {/* smoke rises after blowing */}
        <AnimatePresence>
          {!lit && celebrated > 0 && (
            <motion.span
              key={celebrated}
              className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-2"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 0.4, 0.8].map((d) => (
                <motion.span
                  key={d}
                  className="block h-5 w-2.5 rounded-full bg-slate-300/70 blur-[2px]"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -44, opacity: [0, 0.8, 0], scaleX: [1, 1.6] }}
                  transition={{ duration: 2, delay: d }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* cat reacts + confetti + hearts after blowing */}
      <AnimatePresence>
        {celebrated > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute inset-x-0 top-0">
            <RisingParticles x={120} y={30} count={8} kind="heart" />
            {celebrated === 1 && <Confetti count={30} />}
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 10 }}
              className="bday-scrawl absolute -right-2 top-6 text-2xl text-[color:var(--bday-rose-deep)]"
            >
              happy birthday!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="bday-scrawl mt-1 text-sm opacity-60">
        {lit ? "tap the candles — make it a good wish ♡" : "wish locked in ♡"}
      </p>
    </div>
  );
}
