"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "./effects";

/**
 * PageDecor — a themed illustrated scrapbook environment that frames
 * the edges of a day page. Center content stays clean; the edges get
 * vines, roses, coffee, books, candles, notes and tiny cat cameos.
 *
 * Everything is hand-drawn SVG in the same palette as the rest of the
 * experience, positioned absolutely and pointer-events-none so it never
 * blocks the actual interaction. Hidden entirely under reduced motion
 * movement rules (still rendered, but static).
 */

export type DecorTheme =
  | "roses"
  | "flowers"
  | "chocolates"
  | "coffee"
  | "plushie"
  | "gift"
  | "letter"
  | "memory"
  | "heart"
  | "mystery"
  | "moon"
  | "sealed"
  | "birthday";

const NOTE_COLORS = ["#fdf8ef", "#f9f1e2", "#fdf3ec", "#f7efe1"];

/* ── palette (matches birthday.css tokens) ───────────────────── */
const C = {
  rose: "#c9808a",
  roseDeep: "#a75d68",
  blush: "#e8b7b7",
  blushSoft: "#f3d7d5",
  coffee: "#5b4232",
  coffeeSoft: "#8a6a52",
  cocoa: "#3f2d22",
  sage: "#a8b79a",
  sageDeep: "#7d8f6e",
  cream: "#f7efe1",
  paper: "#fdf8ef",
  gold: "#d9b36c",
};

/* ── building blocks ─────────────────────────────────────────── */

function RoseHead({ r = 12, full = true }: { r?: number; full?: boolean }) {
  return (
    <g>
      <circle r={r} fill={C.rose} stroke={C.roseDeep} strokeWidth="1.8" />
      {full && (
        <>
          <circle r={r * 0.62} fill="#e8a3ab" stroke={C.roseDeep} strokeWidth="1.1" />
          <circle r={r * 0.3} fill="#f3c1c6" stroke={C.roseDeep} strokeWidth="0.9" />
          <path
            d={`M${-r * 0.7} ${-r * 0.25} q${r * 0.32} -${r * 0.45} ${r * 0.7} -${r * 0.2} M${r * 0.28} ${-r * 0.62} q${r * 0.38} ${r * 0.14} ${r * 0.36} ${r * 0.5}`}
            stroke={C.roseDeep}
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {!full && (
        // a closed bud
        <path
          d={`M${-r * 0.5} ${r * 0.4} q0 ${-r * 1.5} ${r * 0.5} ${-r * 1.6} q${r * 0.5} ${r * 0.1} ${r * 0.5} ${r * 1.6}`}
          fill="#e8a3ab"
          stroke={C.roseDeep}
          strokeWidth="1.1"
        />
      )}
    </g>
  );
}

function Leaf({ s = 1, rotate = 0 }: { s?: number; rotate?: number }) {
  return (
    <path
      d="M0 0 q7 -5 13 0 q-7 5 -13 0 Z"
      fill={C.sage}
      stroke={C.sageDeep}
      strokeWidth="1"
      transform={`scale(${s}) rotate(${rotate})`}
    />
  );
}

function TinyHeart({ s = 1, filled = true }: { s?: number; filled?: boolean }) {
  return (
    <path
      d="M5 8.6C2.2 6.3 0.5 4.7 0.5 2.9 0.5 1.6 1.5 0.5 2.9 0.5c0.9 0 1.7 0.5 2.1 1.3C5.5 1 6.3 0.5 7.2 0.5c1.4 0 2.4 1.1 2.4 2.4 0 1.8-1.7 3.4-4.6 5.7Z"
      transform={`scale(${s})`}
      fill={filled ? C.blush : "none"}
      stroke={filled ? "none" : C.rose}
      strokeWidth={filled ? 0 : 1.4}
    />
  );
}

function Sparkle({ s = 1 }: { s?: number }) {
  return (
    <path
      d="M5 0c.5 2.5 1.8 3.8 4.6 4.4C6.8 5 5.5 6.3 5 9 4.5 6.3 3.2 5 .4 4.4 3.2 3.8 4.5 2.5 5 0Z"
      transform={`scale(${s})`}
      fill={C.gold}
      opacity="0.9"
    />
  );
}

function WigglyLine({ w = 60 }: { w?: number }) {
  return (
    <path
      d={`M0 2 q${w * 0.15} -4 ${w * 0.3} 0 t${w * 0.3} 0 t${w * 0.3} 0 t${w * 0.1} 0`}
      stroke={C.coffeeSoft}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      opacity="0.55"
    />
  );
}

/** A climbing / curling vine with mixed roses, buds and leaves. */
function Vine({
  length = 160,
  mirror = false,
  roses = 3,
  curl = 26,
}: {
  length?: number;
  mirror?: boolean;
  roses?: number;
  curl?: number;
}) {
  const items = [];
  for (let i = 0; i < roses; i++) {
    const t = (i + 1) / (roses + 1);
    items.push(
      <g key={`r${i}`} transform={`translate(${(i % 2 ? 16 : -12)} ${t * length})`}>
        <RoseHead r={i % 2 ? 8 : 11} full={i % 2 === 0} />
      </g>
    );
  }
  for (let i = 0; i < roses * 2; i++) {
    const t = ((i + 0.5) * length) / (roses * 2 + 1);
    items.push(
      <g key={`l${i}`} transform={`translate(${i % 2 ? 7 : -8} ${t}) rotate(${i % 2 ? 18 : -160})`}>
        <Leaf s={0.85} />
      </g>
    );
  }
  return (
    <g transform={mirror ? "scale(-1,1)" : undefined}>
      <path
        d={`M0 0 q${curl} ${length * 0.2} 0 ${length * 0.45} q${-curl} ${length * 0.25} 4 ${length * 0.55}`}
        stroke={C.sageDeep}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {items}
      <g transform="translate(2 0)">
        <TinyHeart s={0.8} filled={false} />
      </g>
    </g>
  );
}

/** Handwritten note on taped paper. */
function Note({
  text,
  rotate = -2,
  color = 0,
  className,
}: {
  text: string;
  rotate?: number;
  color?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`absolute pointer-events-none ${className ?? ""}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      animate={reduced ? {} : { rotate: [rotate, rotate + 0.8, rotate] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative px-2.5 py-1 shadow-[0_2px_4px_rgba(91,66,50,0.18)]"
        style={{ background: NOTE_COLORS[color % NOTE_COLORS.length], borderRadius: 3, border: "1px solid rgba(91,66,50,.12)" }}
      >
        {/* washi tape on top */}
        <span
          className="absolute -top-2 left-1/2 h-4 w-9 -translate-x-1/2"
          style={{
            background: "repeating-linear-gradient(135deg, rgba(232,183,183,.85), rgba(232,183,183,.85) 5px, rgba(243,215,213,.75) 5px, rgba(243,215,213,.75) 10px)",
            borderRadius: 1,
          }}
        />
        <span className="bday-scrawl whitespace-nowrap text-[13px] leading-tight text-[color:var(--bday-coffee)]">
          {text}
        </span>
      </div>
    </motion.div>
  );
}

/** Cream mug with pink florals, heart latte art and looping steam hearts. */
function CoffeeCup({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={`pointer-events-none absolute ${className ?? ""}`}>
      <svg viewBox="0 0 70 84" width="58" height="70">
        {/* steam hearts */}
        {reduced ? null : (
          <g>
            {[0, 1, 2].map((i) => (
              <motion.g
                key={i}
                transform={`translate(${20 + i * 12} 18)`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: [0, 0.75, 0], y: -16 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
              >
                <TinyHeart s={0.75} filled />
                <path d="M-3 -6 q3 -6 6 0" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
              </motion.g>
            ))}
          </g>
        )}
        {/* mug body */}
        <path d="M12 30 h34 v16 a17 17 0 0 1 -17 17 a17 17 0 0 1 -17 -17 Z" fill={C.paper} stroke={C.coffee} strokeWidth="2.2" />
        <path d="M46 34 h5 a6.5 6.5 0 0 1 0 13 h-5" fill="none" stroke={C.coffee} strokeWidth="2" />
        {/* floral detail */}
        <g transform="translate(29 47)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} rx="2.2" ry="3.6" fill={C.blushSoft} stroke={C.rose} strokeWidth="0.8" transform={`rotate(${a}) translate(0 -4.6)`} />
          ))}
          <circle r="1.8" fill={C.gold} />
        </g>
        {/* coffee + heart latte art */}
        <ellipse cx="29" cy="30" rx="17" ry="3.8" fill="#8a5a3c" stroke={C.coffee} strokeWidth="1.6" />
        <path d="M29 28.4 c-2.4-2-5-1-4.6 1 .3 1.8 2.8 2.8 4.6 4 1.8-1.2 4.3-2.2 4.6-4 .4-2-2.2-3-4.6-1Z" fill="#f3e3da" opacity="0.95" />
      </svg>
    </div>
  );
}

/** Stack of three hand-lettered books + a flickering candle. */
function BooksAndCandle({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const books = [
    { w: 64, h: 11, c: "#e8b7b7", t: "Good Days" },
    { w: 58, h: 11, c: "#a8b79a", t: "Better Days" },
    { w: 60, h: 11, c: "#f0dcc0", t: "With You ♡" },
  ];
  return (
    <div className={`pointer-events-none absolute ${className ?? ""}`}>
      <svg viewBox="0 0 150 96" width="130" height="84">
        {books.map((b, i) => (
          <g key={i} transform={`translate(${(150 - b.w) / 2 - 24} ${72 - i * b.h})`}>
            <rect width={b.w} height={b.h} rx="2" fill={b.c} stroke={C.coffee} strokeWidth="1.6" />
            <line x1="6" y1={b.h} x2="6" y2="0" stroke={C.coffee} strokeWidth="1" opacity="0.4" />
            <text x={b.w / 2 + 2} y={b.h - 3} textAnchor="middle" fontSize="7.2" fill={C.cocoa} style={{ fontFamily: "'Gochi Hand', cursive" }}>
              {b.t}
            </text>
          </g>
        ))}
        {/* tiny cat peeking from behind the books */}
        <g transform="translate(112 44)">
          <circle cx="0" cy="12" r="12" fill={C.paper} stroke={C.cocoa} strokeWidth="1.8" />
          <path d="M-9 4 L-11 -4 L-4 0 Z" fill={C.paper} stroke={C.cocoa} strokeWidth="1.6" />
          <path d="M9 4 L11 -4 L4 0 Z" fill={C.paper} stroke={C.cocoa} strokeWidth="1.6" />
          <circle cx="-3.6" cy="10" r="1.4" fill={C.cocoa} />
          <circle cx="3.6" cy="10" r="1.4" fill={C.cocoa} />
          <ellipse cx="0" cy="14" rx="1.6" ry="1.1" fill={C.rose} />
        </g>
        {/* candle */}
        <g transform="translate(30 22)">
          <motion.g
            animate={reduced ? {} : { scaleY: [1, 1.18, 0.92, 1.1, 1], scaleX: [1, 0.94, 1.06, 0.97, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "0px", originY: "14px" }}
          >
            <path d="M0 14 q-3 -6 0 -10 q3 4 0 10Z" fill="#f6c453" stroke="#d9a13c" strokeWidth="1" />
          </motion.g>
          <line x1="0" y1="14" x2="0" y2="16" stroke={C.cocoa} strokeWidth="1" />
          <rect x="-6" y="16" width="12" height="22" rx="2.5" fill={C.paper} stroke={C.coffee} strokeWidth="1.8" />
          <path d="M-6 24 h12" stroke={C.blush} strokeWidth="2.4" />
          <rect x="-8" y="38" width="16" height="3" rx="1.5" fill={C.gold} stroke={C.coffee} strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

/** A tiny sleeping cat curled in a corner. */
function SleepingCat({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className ?? ""}`}>
      <svg viewBox="0 0 60 40" width="52" height="36">
        <ellipse cx="30" cy="26" rx="22" ry="12" fill={C.paper} stroke={C.cocoa} strokeWidth="1.8" />
        <path d="M16 18 q-3 -9 4 -8 M44 18 q3 -9 -4 -8" fill={C.paper} stroke={C.cocoa} strokeWidth="1.6" />
        <path d="M20 24 q4 3 8 0 M32 24 q4 3 8 0" stroke={C.cocoa} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M52 22 q6 -2 4 -8" stroke={C.cocoa} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ── per-theme note text ─────────────────────────────────────── */
const THEME_NOTES: Record<DecorTheme, string[]> = {
  roses: ["roses for my favorite girl ♡", "pretty things remind me of you", "just because ♡"],
  flowers: ["day one!! ♡", "starting you off right", "hi it's me ♡"],
  chocolates: ["you get the last one. maybe", "careful, it melts", "a little treat"],
  coffee: ["you + me + coffee ♡", "our kind of morning", "no we can't have a cat at the café"],
  plushie: ["softest boy award ♡", "he's a good listener", "hug certified"],
  gift: ["tied it myself ♡", "no shaking", "small but cute. like something else i know"],
  letter: ["read slowly ♡", "yes i meant all of it", "seal was harder than it looks"],
  memory: ["remember this one? ♡", "my favorite day", "we need more pictures"],
  heart: ["it's yours ♡", "handle with care", "almost there"],
  mystery: ["no shaking allowed ♡", "nice try", "even the cat doesn't know"],
  moon: ["same moon, same me ♡", "make a real wish →", "goodnight, little star"],
  sealed: ["NOT yet ♡ (seriously)", "tomorrow. i promise", "patience, love"],
  birthday: ["the best day ♡", "all of it is yours", "make a wish!"],
};

/** Sticker-ish corner flowers / props per theme (small, edge-only). */
function ThemeProp({ theme }: { theme: DecorTheme }) {
  switch (theme) {
    case "chocolates":
      return (
        <g>
          <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#8a5a3c" stroke={C.coffee} strokeWidth="1.6" transform="rotate(-8)" />
          <path d="M-12 0 h24 M0 -8 v16" stroke="#5b4232" strokeWidth="1" transform="rotate(-8)" opacity="0.5" />
        </g>
      );
    case "plushie":
      return (
        <g transform="rotate(6)">
          <rect x="-14" y="-6" width="28" height="14" rx="5" fill={C.blushSoft} stroke={C.rose} strokeWidth="1.6" />
          <circle cx="-10" cy="-8" r="3.4" fill={C.blushSoft} stroke={C.rose} strokeWidth="1.4" />
          <circle cx="10" cy="-8" r="3.4" fill={C.blushSoft} stroke={C.rose} strokeWidth="1.4" />
        </g>
      );
    case "letter":
    case "sealed":
      return (
        <g transform="rotate(-5)">
          <rect x="-13" y="-9" width="26" height="18" rx="2" fill={C.paper} stroke={C.rose} strokeWidth="1.6" />
          <path d="M-13 -8 L0 1 L13 -8" fill="none" stroke={C.rose} strokeWidth="1.3" />
        </g>
      );
    case "mystery":
      return (
        <g transform="rotate(4)">
          <rect x="-11" y="-11" width="22" height="22" rx="3" fill={C.paper} stroke={C.rose} strokeWidth="1.8" />
          <text x="0" y="5" textAnchor="middle" fontSize="14" fill={C.roseDeep} style={{ fontFamily: "'Caveat', cursive" }}>?</text>
        </g>
      );
    case "moon":
      return (
        <g>
          <path d="M6 -8 a9 9 0 1 0 6 9 6.6 6.6 0 0 1-6-9Z" fill="#e9d9a6" stroke={C.gold} strokeWidth="1.4" />
          <path d="M-12 4 l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1 1-2.4Z" fill={C.gold} opacity="0.8" />
        </g>
      );
    case "birthday":
      return (
        <g transform="rotate(-6)">
          <ellipse cx="0" cy="0" rx="9" ry="11" fill={C.blushSoft} stroke={C.rose} strokeWidth="1.6" />
          <path d="M0 -11 q1 -4 -1 -6" stroke={C.roseDeep} strokeWidth="1.2" fill="none" />
          <path d="M-1 -17 c1.4-1.4 1.4-3 0-4.4-1.4 1.4-1.4 3 0 4.4Z" fill={C.gold} />
        </g>
      );
    default:
      return (
        <g transform="rotate(-4)">
          <circle r="7" fill={C.blushSoft} stroke={C.rose} strokeWidth="1.5" />
          <circle r="2.6" fill={C.gold} stroke={C.coffee} strokeWidth="0.8" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} rx="2.4" ry="4.2" fill={C.blushSoft} stroke={C.rose} strokeWidth="0.9" transform={`rotate(${a}) translate(0 -7.6)`} />
          ))}
        </g>
      );
  }
}

/* ── the main export: a full themed page environment ─────────── */

export function PageDecor({
  theme,
  giantBouquet = false,
}: {
  theme: DecorTheme;
  /** roses theme gets the full vine + coffee + books treatment */
  giantBouquet?: boolean;
}) {
  const reduced = useReducedMotion();
  const isRoses = theme === "roses";
  const notes = THEME_NOTES[theme];

  const vineSway = (delay: number) =>
    reduced
      ? {}
      : {
          rotate: [-1.2, 1.2, -1.2],
        };
  const vineSwayTransition = (delay: number) =>
    reduced ? {} : { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* ── corner rose vines (strongest on the roses theme) ────── */}
      {/* top-left: curling toward center */}
      <motion.svg
        viewBox="-40 -30 80 200"
        className="absolute -left-2 -top-2 h-56 w-24 sm:h-72 sm:w-28"
        animate={vineSway(0)}
        transition={vineSwayTransition(0)}
      >
        <Vine length={150} roses={isRoses ? 4 : 3} curl={isRoses ? 30 : 20} />
      </motion.svg>

      {/* top-right: large hanging vine with several blossoms */}
      <motion.svg
        viewBox="-40 -30 80 230"
        className="absolute -right-2 -top-3 h-64 w-24 sm:h-80 sm:w-28"
        animate={vineSway(1.4)}
        transition={vineSwayTransition(1.4)}
      >
        <g transform="scale(1,-1) translate(0,-190)">
          <Vine length={165} mirror roses={isRoses ? 5 : 3} curl={isRoses ? 34 : 22} />
        </g>
      </motion.svg>

      {/* left edge: thin vertical climber */}
      <motion.svg
        viewBox="-30 -10 60 170"
        className="absolute -left-1 bottom-10 hidden h-44 w-12 sm:block"
        animate={vineSway(0.8)}
        transition={vineSwayTransition(0.8)}
      >
        <Vine length={140} roses={2} curl={14} />
      </motion.svg>

      {/* right edge: thin vertical climber */}
      <motion.svg
        viewBox="-30 -10 60 170"
        className="absolute -right-1 bottom-24 hidden h-44 w-12 sm:block"
        animate={vineSway(2)}
        transition={vineSwayTransition(2)}
      >
        <Vine length={140} mirror roses={2} curl={14} />
      </motion.svg>

      {/* bottom: subtle vine curving across the lower edge */}
      <svg viewBox="0 0 600 46" className="absolute bottom-0 left-0 h-10 w-full opacity-80" preserveAspectRatio="none">
        <path d="M0 34 q60 -14 120 -4 t120 2 t120 -8 t120 6 t120 -2" stroke={C.sageDeep} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
        {[[50, 26], [170, 30], [300, 24], [420, 32], [540, 26]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {i % 2 === 0 ? <RoseHead r={7} full /> : <g transform="scale(.8)"><Leaf rotate={-20} /></g>}
          </g>
        ))}
        <g transform="translate(90 30)"><TinyHeart s={0.9} filled={false} /></g>
        <g transform="translate(360 30)"><TinyHeart s={0.8} /></g>
      </svg>

      {/* ── scattered small roses / flowers / hearts / sparkles ── */}
      {[
        { x: "7%", y: "22%", s: 0.9 },
        { x: "88%", y: "40%", s: 0.75 },
        { x: "12%", y: "64%", s: 0.7 },
        { x: "90%", y: "72%", s: 0.85 },
        { x: "22%", y: "10%", s: 0.6 },
        { x: "76%", y: "12%", s: 0.65 },
      ].map((p, i) => (
        <motion.svg
          key={i}
          viewBox="-16 -16 32 32"
          className="absolute"
          style={{ left: p.x, top: p.y, width: 30 * p.s, height: 30 * p.s }}
          animate={reduced ? {} : { y: [0, -6, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        >
          <ThemeProp theme={theme} />
        </motion.svg>
      ))}

      {/* tiny hearts + sparkles drifting */}
      {[
        { x: "16%", y: "34%", f: true },
        { x: "84%", y: "26%", f: false },
        { x: "6%", y: "48%", f: false },
        { x: "93%", y: "56%", f: true },
        { x: "26%", y: "80%", f: false },
        { x: "68%", y: "84%", f: true },
      ].map((p, i) => (
        <motion.svg
          key={`h${i}`}
          viewBox="0 0 10 10"
          className="absolute"
          style={{ left: p.x, top: p.y, width: 12 + (i % 3) * 4, height: 12 + (i % 3) * 4 }}
          animate={reduced ? {} : { y: [0, -10, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }}
        >
          {i % 2 === 0 ? <TinyHeart s={0.9} filled={p.f} /> : <Sparkle s={0.9} />}
        </motion.svg>
      ))}

      {/* ── handwritten notes (taped paper, not UI cards) ───────── */}
      <Note text={notes[0]} rotate={-3} color={0} className="left-[6%] top-[13%] hidden md:block" />
      <Note text={notes[1]} rotate={2.5} color={1} className="right-[8%] top-[64%] hidden md:block" />
      <Note text={notes[2]} rotate={-1.5} color={2} className="bottom-[9%] left-[12%] hidden lg:block" />

      {/* ── theme extras ────────────────────────────────────────── */}
      {isRoses && (
        <>
          <CoffeeCup className="bottom-[16%] right-[5%] hidden sm:block" />
          <BooksAndCandle className="bottom-[10%] right-[16%] hidden md:block" />
          <SleepingCat className="bottom-[7%] left-[4%] hidden lg:block" />
          {/* a tiny cat holding a ribbon near the top */}
          <div className="pointer-events-none absolute left-[30%] top-[4%] hidden xl:block">
            <svg viewBox="0 0 60 50" width="46" height="38">
              <circle cx="30" cy="26" r="13" fill={C.paper} stroke={C.cocoa} strokeWidth="1.8" />
              <path d="M22 17 L20 8 L27 13 Z M38 17 L40 8 L33 13 Z" fill={C.paper} stroke={C.cocoa} strokeWidth="1.6" />
              <circle cx="26" cy="24" r="1.4" fill={C.cocoa} />
              <circle cx="34" cy="24" r="1.4" fill={C.cocoa} />
              <path d="M28 30 q2 2 4 0" stroke={C.cocoa} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M30 39 q10 4 16 -2" stroke={C.blush} strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}

      {/* non-roses themes get one smaller cozy prop so no page is empty */}
      {!isRoses && (
        <>
          {(theme === "coffee" || theme === "plushie" || theme === "memory") && (
            <CoffeeCup className="bottom-[14%] right-[6%] hidden sm:block" />
          )}
          {(theme === "letter" || theme === "sealed" || theme === "birthday") && (
            <BooksAndCandle className="bottom-[8%] right-[8%] hidden md:block" />
          )}
          {(theme === "flowers" || theme === "heart" || theme === "gift") && (
            <SleepingCat className="bottom-[8%] right-[8%] hidden lg:block" />
          )}
        </>
      )}
    </div>
  );
}
