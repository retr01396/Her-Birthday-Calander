"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Ambient effect primitives — petals, sparkles, confetti, bursts.
 * All respect prefers-reduced-motion (CSS layer) and are purely
 * decorative (pointer-events: none, aria-hidden).
 */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Tiny declarative choreography helper:
 *   const step = useSequence();
 *   step >= 2 && <Something />
 * Steps advance on a timeline (ms) — spring animations inside each step
 * keep the motion feeling hand-made, while reduced-motion users get every
 * step revealed instantly.
 */
export function useSequence(delays: number[], opts?: { auto?: boolean }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const started = useRef(false);

  const advance = useCallback(() => setStep((s) => s + 1), []);

  useEffect(() => {
    if (!opts?.auto || started.current) return;
    started.current = true;
    if (reduced) {
      setStep(delays.length);
      return;
    }
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, [opts?.auto, delays, reduced]);

  return { step, advance, reset: () => setStep(0), jumpToEnd: () => setStep(delays.length) };
}

/**
 * Soft full-screen ambient wash used by "moment" scenes (Day 7/9/11):
 * a fixed, pointer-events-none tint that can fade the page warmer,
 * darker, or pinker without touching layout.
 */
export function AmbientWash({ color, opacity = 0 }: { color: string; opacity: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-10 pointer-events-none"
      initial={false}
      animate={{ backgroundColor: color, opacity }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    />
  );
}

/**
 * Particles that rise gently upward from a point and fade —
 * chocolate bits, steam hearts, sparkles from the gift box.
 */
export function RisingParticles({
  x,
  y,
  count = 8,
  colors = ["#e8b7b7", "#d9b36c", "#f3d7d5"],
  kind = "heart",
  onDone,
}: {
  x: number;
  y: number;
  count?: number;
  colors?: string[];
  kind?: "heart" | "sparkle" | "choco";
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        dx: rand(-46, 46),
        rise: rand(70, 130),
        dur: rand(1.6, 2.6),
        delay: rand(0, 0.5),
        size: rand(9, 16),
        color: colors[i % colors.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, x, y]
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  if (reduced) {
    onDone?.();
    return null;
  }

  return (
    <span aria-hidden="true" className="absolute" style={{ left: x, top: y, pointerEvents: "none", zIndex: 25 }}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.dx,
            y: -p.rise,
            scale: [0.4, 1, 1, 0.7],
            rotate: rand(-40, 40),
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
        >
          {kind === "heart" ? (
            <svg width={p.size} height={p.size} viewBox="0 0 20 18">
              <path d="M10 17C4.5 12.6 1 9.4 1 5.9 1 3.2 3 1 5.7 1c1.8 0 3.3 1 4.3 2.6C11 2 12.5 1 14.3 1 17 1 19 3.2 19 5.9c0 3.5-3.5 6.7-9 11.1Z" fill={p.color} />
            </svg>
          ) : kind === "choco" ? (
            <svg width={p.size} height={p.size} viewBox="0 0 16 16">
              <rect width="16" height="16" rx="3" fill={p.color} stroke="#5b4232" strokeWidth="1" />
              <path d="M8 1v14M1 8h14" stroke="#5b4232" strokeWidth="0.8" opacity="0.5" />
            </svg>
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 20 20">
              <path d="M10 0c1 5 3.5 7.5 9 9-5.5 1.5-8 4-9 9-1-5-3.5-7.5-9-9 5.5-1.5 8-4 9-9Z" fill={p.color} />
            </svg>
          )}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Soft hearts slowly drifting UP the screen (very low opacity, ambient).
 * Used once in the layout so every page feels alive.
 * Client-only after mount — avoids SSR/CSR random-value hydration mismatches.
 */
export function FloatingHeartsAmbient({ count = 7 }: { count?: number }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(4, 94),
        dur: rand(12, 20),
        delay: rand(0, 14),
        size: rand(12, 22),
        hue: i % 3,
      })),
    [count]
  );
  if (!mounted || reduced) return null;
  return (
    <div aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="bday-heartdrift"
          style={{
            left: `${h.left}%`,
            "--dur": `${h.dur}s`,
            "--delay": `${h.delay}s`,
          } as React.CSSProperties}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 20 18">
            <path
              d="M10 17C4.5 12.6 1 9.4 1 5.9 1 3.2 3 1 5.7 1c1.8 0 3.3 1 4.3 2.6C11 2 12.5 1 14.3 1 17 1 19 3.2 19 5.9c0 3.5-3.5 6.7-9 11.1Z"
              fill={h.hue === 0 ? "#eec3c3" : h.hue === 1 ? "#f3d7d5" : "#e5a3a3"}
              opacity="0.55"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Gentle floating petals / hearts across the screen. */
export function FloatingPetals({
  count = 10,
  hearts = false,
}: {
  count?: number;
  hearts?: boolean;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(2, 96),
        drift: rand(-60, 60),
        dur: rand(8, 15),
        delay: rand(0, 10),
        size: rand(12, 22),
        hue: i % 3,
      })),
    [count]
  );
  if (!mounted || reduced) return null;
  return (
    <div aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="bday-petal"
          style={
            {
              left: `${p.left}%`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        >
          {hearts ? (
            <svg width={p.size} height={p.size} viewBox="0 0 20 18">
              <path
                d="M10 17C4.5 12.6 1 9.4 1 5.9 1 3.2 3 1 5.7 1c1.8 0 3.3 1 4.3 2.6C11 2 12.5 1 14.3 1 17 1 19 3.2 19 5.9c0 3.5-3.5 6.7-9 11.1Z"
                fill={p.hue === 0 ? "#e8b7b7" : p.hue === 1 ? "#f3d7d5" : "#e5a3a3"}
              />
            </svg>
          ) : (
            <svg width={p.size} height={p.size * 0.7} viewBox="0 0 20 14">
              <path
                d="M1 12C4 4 12 0 19 1c-2 5-8 11-18 11Z"
                fill={p.hue === 0 ? "#f3d7d5" : p.hue === 1 ? "#eec6c0" : "#f6e3da"}
              />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}

/** One-shot sparkle/heart burst from a click point. */
export function Burst({
  x,
  y,
  hearts = false,
  count = 10,
  onDone,
}: {
  x: number;
  y: number;
  hearts?: boolean;
  count?: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
        const dist = rand(34, 76);
        return {
          id: i,
          bx: Math.cos(angle) * dist,
          by: Math.sin(angle) * dist,
          size: rand(10, 20),
          delay: rand(0, 0.15),
        };
      }),
    [count]
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1100);
    return () => clearTimeout(t);
  }, [onDone]);

  if (reduced) {
    onDone?.();
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="absolute"
      style={{ left: x, top: y, pointerEvents: "none", zIndex: 20 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="bday-burst-particle"
          style={
            {
              "--bx": `${p.bx}px`,
              "--by": `${p.by}px`,
              animationDelay: `${p.delay}s`,
              left: 0,
              top: 0,
            } as React.CSSProperties
          }
        >
          {hearts ? (
            <svg width={p.size} height={p.size} viewBox="0 0 20 18">
              <path
                d="M10 17C4.5 12.6 1 9.4 1 5.9 1 3.2 3 1 5.7 1c1.8 0 3.3 1 4.3 2.6C11 2 12.5 1 14.3 1 17 1 19 3.2 19 5.9c0 3.5-3.5 6.7-9 11.1Z"
                fill="#e896a0"
              />
            </svg>
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 20 20">
              <path
                d="M10 0c1 5 3.5 7.5 9 9-5.5 1.5-8 4-9 9-1-5-3.5-7.5-9-9 5.5-1.5 8-4 9-9Z"
                fill="#d9b36c"
              />
            </svg>
          )}
        </span>
      ))}
    </span>
  );
}

/** Celebration confetti rain (one-shot). */
export function Confetti({ count = 60 }: { count?: number }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        drift: rand(-90, 90),
        dur: rand(3, 6.5),
        delay: rand(0, 2.2),
        size: rand(7, 13),
        color: ["#e8b7b7", "#d9b36c", "#a8b79a", "#f3d7d5", "#c9808a"][i % 5],
        round: i % 3 === 0,
      })),
    [count]
  );
  if (!mounted || reduced) return null;
  return (
    <div aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="bday-confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              background: p.color,
              borderRadius: p.round ? "50%" : 2,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Small decorative divider: ♡ ─ ✿ ─ ♡ */
export function DoodleDivider({ className }: { className?: string }) {
  return (
    <div className={cn("bday-doodle-divider", className)} aria-hidden="true">
      <span>♡</span>
      <svg width="54" height="12" viewBox="0 0 54 12" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round">
        <path d="M1 6 h52" strokeDasharray="1 5" />
      </svg>
      <span>✿</span>
    </div>
  );
}

/** Simple centered modal used by day scenes + world hotspots. */
export function ScrapbookModal({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="bday-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={cn("bday-paper-card bday-modal-card bday-taped", wide && "max-w-3xl")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-2 text-2xl leading-none text-[color:var(--bday-rose-deep)] hover:scale-110 transition-transform"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
