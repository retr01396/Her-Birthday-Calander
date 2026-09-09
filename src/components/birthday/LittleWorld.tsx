"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BIG_GIFT,
  LETTERS,
  MEMORIES,
  MUSIC,
  WORLD,
  WORLD_HOTSPOT_EXTRAS as EXTRAS,
} from "@/lib/birthday/config";
import { BirthdayCat } from "./BirthdayCat";
import {
  Burst,
  Confetti,
  DoodleDivider,
  RisingParticles,
  ScrapbookModal,
  useReducedMotion,
} from "./effects";
import { PageDecor } from "./PageDecor";
import { PolaroidImage } from "./PolaroidImage";
import {
  DoodleHeart,
  DoodleLetter,
  DoodleMoon,
  DoodleMusic,
  DoodlePolaroid,
  DoodlePlushie,
  DoodleCoffee,
  DoodleGift,
  DoodleStar,
  DoodleSparkle,
} from "./doodles";

/**
 * OUR LITTLE WORLD — every hotspot runs a small choreographed
 * sequence, ending in the cinematic BIG gift box reveal.
 */

type HotspotId =
  | "photoWall"
  | "birthdayLetter"
  | "musicPlayer"
  | "coffeeMug"
  | "plushie"
  | "nightWindow"
  | "giftBox";

interface Hotspot {
  id: HotspotId;
  label: string;
  x: string;
  y: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const HOTSPOTS: Hotspot[] = [
  { id: "photoWall", label: "Photo Wall", x: "12%", y: "16%", icon: DoodlePolaroid },
  { id: "birthdayLetter", label: "Birthday Letter", x: "44%", y: "13%", icon: DoodleLetter },
  { id: "musicPlayer", label: "Music Player", x: "76%", y: "18%", icon: DoodleMusic },
  { id: "coffeeMug", label: "Coffee Mug", x: "18%", y: "58%", icon: DoodleCoffee },
  { id: "plushie", label: "Plushie", x: "40%", y: "62%", icon: DoodlePlushie },
  { id: "nightWindow", label: "Night Window", x: "70%", y: "55%", icon: DoodleMoon },
  { id: "giftBox", label: "The Big Gift", x: "88%", y: "68%", icon: DoodleGift },
];

export function LittleWorld() {
  const router = useRouter();
  const [active, setActive] = useState<HotspotId | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; k: number } | null>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  function handleHotspot(id: HotspotId, e: React.MouseEvent) {
    const rect = roomRef.current?.getBoundingClientRect();
    if (rect) {
      setBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, k: Math.random() });
    }
    setActive(id);
  }

  return (
    <div className="bday-center !min-h-auto relative py-8">
      <PageDecor theme="birthday" />
      <div className="relative z-10 w-full" style={{ maxWidth: 720 }}>
        <header className="mb-4 text-center">
          <DoodleDivider />
          <h1 className="bday-h1 mt-2">{WORLD.title}</h1>
          <p className="bday-message opacity-75">{WORLD.hint}</p>
        </header>

        {/* ── the room ─────────────────────────────────────────── */}
        <div
          ref={roomRef}
          className="bday-room relative mx-auto"
          style={{ aspectRatio: "16 / 10", minHeight: 320 }}
        >
          {burst && (
            <Burst key={burst.k} x={burst.x} y={burst.y} count={8} onDone={() => setBurst(null)} />
          )}

          {/* deco + the cat living in the room */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[6%] top-[8%] h-[26%] w-[10%] rounded-md bg-[#fdf8ef] shadow-md" style={{ transform: "rotate(-3deg)" }}>
              <DoodleHeart size={30} className="m-auto mt-3 text-[color:var(--bday-rose)]" />
            </div>
            <div className="absolute right-[5%] top-[36%] h-[12%] w-[16%] rounded-md bg-[#fdf8ef] shadow-md" style={{ transform: "rotate(2deg)" }}>
              <DoodleStar size={22} className="m-auto mt-1.5 text-[color:var(--bday-gold)]" />
            </div>
            <div className="absolute bottom-[6%] left-1/2 h-[14%] w-[52%] -translate-x-1/2 rounded-[50%] bg-[color:var(--bday-blush-soft)] opacity-70" />
            <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
              <BirthdayCat pose="sit" size={90} className="bday-float" />
            </div>
          </div>

          {/* hotspots */}
          {HOTSPOTS.map((h) => (
            <motion.button
              key={h.id}
              className="bday-hotspot"
              style={{ left: h.x, top: h.y }}
              onClick={(e) => handleHotspot(h.id, e)}
              aria-label={h.label}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
            >
              <h.icon size={34} className="text-[color:var(--bday-cocoa)] drop-shadow" />
              <span className="bday-scrawl pointer-events-none absolute -bottom-5 whitespace-nowrap text-xs text-[color:var(--bday-coffee)]">
                {h.label}
              </span>
            </motion.button>
          ))}
        </div>

        <p className="bday-scrawl mt-10 text-center text-sm opacity-60">
          made by hand, for exactly one person ♡
        </p>
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => router.push("/birthday/journey")}
            className="bday-paw bday-scrawl cursor-pointer text-sm text-[color:var(--bday-rose-deep)] hover:underline"
          >
            ← back to the calendar
          </button>
        </div>
      </div>

      {/* ── hotspot modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <ScrapbookModal open onClose={() => setActive(null)}>
            {active === "photoWall" && <PhotoWallHotspot />}
            {active === "birthdayLetter" && <BirthdayLetterHotspot />}
            {active === "musicPlayer" && <MusicPlayerHotspot />}
            {active === "coffeeMug" && <CoffeeMugHotspot />}
            {active === "plushie" && <PlushieHotspot />}
            {active === "nightWindow" && <NightWindowHotspot />}
            {active === "giftBox" && <BigGiftHotspot />}
          </ScrapbookModal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── PHOTO WALL — photos lift off the wall ────────────────────── */
function PhotoWallHotspot() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      <h3 className="bday-h2 mb-4 text-center">{WORLD.hotspots.photoWall.label}</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {MEMORIES.photos.map((p, i) => (
          <motion.figure
            key={i}
            className="bday-polaroid w-32"
            style={{ rotate: p.tilt ?? 0 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, rotate: 0, scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenIdx(i)}
          >
            <PolaroidImage photo={p} />
            {(p.caption || p.date) && (
              <figcaption className="bday-scrawl mt-1.5 break-words text-center text-xs">
                {p.caption}
                {p.date && <span className="block opacity-55">{p.date}</span>}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </div>
      <p className="bday-message mt-4 text-center opacity-80">
        {WORLD.hotspots.photoWall.message}
      </p>

      {/* lightbox: photo lifts, sparkles, caption fades in */}
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
              initial={{ scale: 0.5, y: 60, rotate: (MEMORIES.photos[openIdx].tilt ?? 0) * 3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PolaroidImage photo={MEMORIES.photos[openIdx]} className="max-h-[55vh] w-full rounded-sm object-cover" />
              {MEMORIES.photos[openIdx].caption && (
                <motion.figcaption
                  className="bday-hand mt-3 text-center text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {MEMORIES.photos[openIdx].caption}
                </motion.figcaption>
              )}
              <motion.span
                className="absolute -right-3 -top-3"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.3 }}
              >
                <DoodleSparkle size={26} className="text-[color:var(--bday-gold)]" />
              </motion.span>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── BIRTHDAY LETTER (renders mainBirthdayLetter from config) ── */
function BirthdayLetterHotspot() {
  const L = LETTERS.birthdayLetter;
  return (
    <motion.div
      className="bday-letter-lines max-h-[68vh] overflow-y-auto px-1"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.25 } } }}
    >
      <motion.h3 variants={lineVar} className="bday-h2 mb-3 text-center">{L.title}</motion.h3>
      <motion.p variants={lineVar} className="bday-hand text-xl">{L.greeting}</motion.p>
      {L.paragraphs.map((p, i) => (
        <motion.p key={i} variants={lineVar} className="mt-2">{p}</motion.p>
      ))}
      <motion.p variants={lineVar} className="bday-hand mt-4 text-right text-lg text-[color:var(--bday-rose-deep)]">
        {L.closing}
        <span className="bday-scrawl ml-2 text-base text-[color:var(--bday-coffee-soft)]">
          {L.signature}
        </span>
      </motion.p>
    </motion.div>
  );
}

const lineVar = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── MUSIC PLAYER — spinning record, loops until the site is closed ── */
function MusicPlayerHotspot() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const track = MUSIC.playlist[0];
  const reduced = useReducedMotion();

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  return (
    <div className="text-center">
      <h3 className="bday-h2 mb-1">{WORLD.hotspots.musicPlayer.label}</h3>
      <p className="bday-scrawl text-sm opacity-60">{MUSIC.hint}</p>

      <div className="mx-auto mt-4 w-56 rounded-2xl border-2 border-[color:var(--bday-coffee)]/25 bg-[color:var(--bday-cream-deep)] p-4 shadow-inner">
        <div className="flex items-center justify-center gap-3">
          {/* the record — spins while playing */}
          <motion.span
            className="grid h-16 w-16 place-items-center rounded-full border-4 border-[color:var(--bday-coffee)]/30 bg-[color:var(--bday-paper)]"
            animate={playing && !reduced ? { rotate: 360 } : {}}
            transition={playing && !reduced ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
          >
            <span className="h-3 w-3 rounded-full bg-[color:var(--bday-rose)]" />
          </motion.span>
          <div className="text-left">
            <p className="bday-hand text-lg leading-tight">{track?.title}</p>
            <p className="bday-scrawl text-sm opacity-60">{track?.artist}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="bday-btn bday-btn--quiet !min-h-[44px] !px-6 !text-lg">
            {playing ? "❚❚ pause" : "▶ play"}
          </motion.button>
        </div>
      </div>

      {/* loops forever until the tab/site is closed */}
      {track && <audio ref={audioRef} src={track.src} loop preload="auto" />}
      <p className="bday-scrawl mt-3 text-xs opacity-50">plays on repeat ♡</p>
    </div>
  );
}

/* ── COFFEE MUG — steam forms tiny hearts ─────────────────────── */
function CoffeeMugHotspot() {
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className="text-center">
      <h3 className="bday-h2 mb-3">{WORLD.hotspots.coffeeMug.label}</h3>
      <motion.button
        onClick={() => setRevealed(true)}
        className="relative mx-auto block"
        whileTap={{ scale: 0.92, rotate: [0, -4, 4, 0] }}
        aria-label="Look into the mug"
      >
        <DoodleCoffee size={90} className="text-[color:var(--bday-coffee)]" />
        {/* heart steam, loops once revealed */}
        {revealed && (
          <span aria-hidden="true" className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-2">
            {[0, 0.6, 1.2].map((d) => (
              <motion.span
                key={d}
                initial={{ opacity: 0, y: 8 }}
                animate={reduced ? {} : { opacity: [0, 0.9, 0], y: -34 }}
                transition={{ repeat: Infinity, duration: 2.2, delay: d }}
              >
                <DoodleHeart size={12} className="text-white/85" />
              </motion.span>
            ))}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="bday-message bday-hand mt-4 text-xl"
          >
            {WORLD.hotspots.coffeeMug.message}
          </motion.p>
        )}
      </AnimatePresence>
      {!revealed && <p className="bday-scrawl mt-2 text-sm opacity-60">{EXTRAS.coffeeHint}</p>}
    </div>
  );
}

/* ── PLUSHIE — cat walks over and hugs ────────────────────────── */
function PlushieHotspot() {
  const [hugging, setHugging] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className="text-center">
      <h3 className="bday-h2 mb-2">{WORLD.hotspots.plushie.label}</h3>
      <button onClick={() => setHugging(true)} className="mx-auto block" aria-label="Hug the plushie">
        <div className="relative flex items-end justify-center">
          <motion.div
            animate={hugging ? { x: 16 } : {}}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <BirthdayCat pose={hugging ? "hug-heart" : "sit"} size={120} />
          </motion.div>
          <motion.svg
            viewBox="0 0 60 70"
            width={70}
            height={82}
            animate={hugging ? { rotate: [-3, 3, -3] } : {}}
            transition={hugging && !reduced ? { repeat: Infinity, duration: 1.4 } : {}}
          >
            <ellipse cx="16" cy="12" rx="7" ry="12" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
            <ellipse cx="40" cy="12" rx="7" ry="12" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
            <ellipse cx="28" cy="42" rx="24" ry="24" fill="#f3d7d5" stroke="#c9808a" strokeWidth="2" />
            <circle cx="20" cy="38" r="2.6" fill="#3f2d22" />
            <circle cx="36" cy="38" r="2.6" fill="#3f2d22" />
            <path d="M24 46 q4 4 8 0" stroke="#3f2d22" strokeWidth="2" fill="none" strokeLinecap="round" />
          </motion.svg>
          {hugging && (
            <motion.span
              className="absolute -top-4 left-1/2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -30 }}
              transition={{ duration: 1.8 }}
            >
              <DoodleHeart size={20} className="text-[color:var(--bday-rose)]" />
            </motion.span>
          )}
        </div>
      </button>
      <p className="bday-message bday-hand mt-3 text-xl">
        {WORLD.hotspots.plushie.message}
      </p>
      {!hugging && <p className="bday-scrawl mt-1 text-sm opacity-60">tap for a hug ♡</p>}
    </div>
  );
}

/* ── NIGHT WINDOW — night fades in, stars appear, moon moves ──── */
function NightWindowHotspot() {
  const [night, setNight] = useState(false);
  const reduced = useReducedMotion();

  const starPos = [
    ["18%", "22%"], ["42%", "12%"], ["64%", "30%"], ["80%", "16%"],
    ["30%", "42%"], ["55%", "55%"], ["12%", "60%"],
  ];

  return (
    <div className="text-center">
      <h3 className="bday-h2 mb-3">{WORLD.hotspots.nightWindow.label}</h3>
      <motion.button
        onClick={() => setNight((v) => !v)}
        className="relative mx-auto block overflow-hidden rounded-xl border-2 border-[color:var(--bday-coffee)]/25 shadow-inner"
        style={{ width: 200, height: 160 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Toggle day and night"
      >
        {/* day sky */}
        <motion.span
          className="absolute inset-0 block"
          animate={{ opacity: night ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : 1 }}
          style={{ background: "linear-gradient(180deg,#cfe0ea,#f0e4d0)" }}
        >
          <span className="absolute left-5 top-6 h-8 w-8 rounded-full bg-[#f6d98a]" />
          <span className="absolute bottom-4 left-8 h-12 w-16 rounded-t-full bg-[color:var(--bday-sage)] opacity-70" />
        </motion.span>

        {/* night sky */}
        <motion.span
          className="absolute inset-0 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: night ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.2 }}
          style={{ background: "linear-gradient(180deg,#3d3450,#241f33)" }}
        >
          {/* stars appear one by one */}
          {night &&
            starPos.map(([l, t], i) => (
              <motion.span
                key={i}
                className="absolute"
                style={{ left: l, top: t }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.75, 1], scale: 1 }}
                transition={{ delay: 0.4 + i * 0.18, duration: 0.5 }}
              >
                <DoodleStar size={11} className="bday-twinkle text-[#e9d9a6]" style={{ animationDelay: `${i * 0.4}s` }} />
              </motion.span>
            ))}
          {/* moon glides into position */}
          <motion.span
            className="absolute right-4 top-3"
            initial={{ x: 30, y: -20, opacity: 0 }}
            animate={night ? { x: 0, y: 0, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
          >
            <DoodleMoon size={44} className="text-[#e9d9a6]" />
          </motion.span>
        </motion.span>
      </motion.button>
      <p className="bday-message bday-hand mt-4 text-xl">
        {WORLD.hotspots.nightWindow.message}
      </p>
      <p className="bday-scrawl mt-1 text-sm opacity-60">{EXTRAS.nightHint}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   THE BIG GIFT BOX — the final cinematic
   shake → ribbon wiggles → cat pulls ribbon → ribbon slides away →
   box opens slowly → warm light → darkened room → sparkles rise →
   "One more thing..." → the REAL surprise
   ══════════════════════════════════════════════════════════════ */
type GiftStage = "closed" | "shake" | "pulling" | "opening" | "reveal";

function BigGiftHotspot() {
  const [stage, setStage] = useState<GiftStage>("closed");
  const reduced = useReducedMotion();
  const s = BIG_GIFT.surprise;

  function tap() {
    if (stage !== "closed") return;
    setStage("shake");
    const d = reduced ? [0, 0, 0] : [700, 1600, 3400];
    setTimeout(() => setStage("pulling"), d[0]);
    setTimeout(() => setStage("opening"), d[1]);
    setTimeout(() => setStage("reveal"), d[2]);
  }

  return (
    <div className="text-center">
      <h3 className="bday-h2 mb-2">The Big Gift</h3>

      <AnimatePresence mode="wait">
        {stage !== "reveal" && (
          <motion.div key="box" exit={{ opacity: 0 }}>
            <p className="bday-scrawl mb-2 text-sm opacity-60">
              {stage === "closed" ? EXTRAS.giftHint : stage === "opening" ? "...!" : ""}
            </p>

            {/* darkened room around the box while it opens */}
            <motion.div
              className="relative mx-auto w-fit py-6"
              animate={stage === "opening" ? { filter: "brightness(0.55)" } : { filter: "brightness(1)" }}
              transition={{ duration: 1 }}
            >
              <motion.div
                onClick={tap}
                role="button"
                aria-label="Open the big gift box"
                className="cursor-pointer"
                animate={
                  stage === "shake"
                    ? { rotate: [0, -2.5, 2.5, -1.5, 1.5, 0], y: [0, -3, 0] }
                    : stage === "pulling"
                      ? { x: [0, -3, 3, 0] }
                      : {}
                }
                transition={{ duration: stage === "shake" ? 0.8 : 0.6 }}
              >
                <BigGiftBox stage={stage} />
              </motion.div>

              {/* the cat approaches and pulls the ribbon */}
              {(stage === "shake" || stage === "pulling") && (
                <motion.div
                  className="absolute -left-10 bottom-4 origin-bottom"
                  initial={{ x: -40, opacity: 0 }}
                  animate={stage === "pulling" ? { x: -8, opacity: 1, rotate: [0, -4, 0] } : { x: -40, opacity: 0.9 }}
                  transition={{ duration: 0.6 }}
                >
                  <BirthdayCat pose={stage === "pulling" ? "drag-plushie" : "sit"} size={100} />
                </motion.div>
              )}

              {/* warm light + rising sparkles from inside */}
              {stage === "opening" && (
                <>
                  <motion.div
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 0.85, scale: 1.6 }}
                    transition={{ duration: 1.4 }}
                    style={{ background: "radial-gradient(circle, rgba(246,224,180,.95), transparent 70%)" }}
                  />
                  <RisingParticles x={140} y={110} count={10} kind="sparkle" colors={["#d9b36c", "#f6e3c0", "#e8b7b7"]} />
                </>
              )}
            </motion.div>

            {/* handwritten tag fades with the ribbon */}
            <AnimatePresence>
              {stage === "closed" && (
                <motion.p
                  exit={{ opacity: 0, y: -8 }}
                  className="bday-hand mt-3 inline-block -rotate-3 rounded bg-[color:var(--bday-paper)] px-3 py-1 text-xl shadow"
                >
                  {BIG_GIFT.tag}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── "One more thing..." then the surprise ───────────── */}
        {stage === "reveal" && (
          <motion.div key="reveal" className="text-left">
            <motion.p
              initial={{ opacity: 0, y: 14, letterSpacing: "0.05em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.02em" }}
              transition={{ duration: 0.9 }}
              className="bday-h2 mb-5 text-center"
            >
              {BIG_GIFT.revealTitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
              className="bday-paper-card bday-taped"
            >
              {s.type === "message" && (
                <>
                  <h4 className="bday-h2 !text-2xl text-[color:var(--bday-rose-deep)]">{s.heading}</h4>
                  {s.lines.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.35 }}
                      className="bday-message bday-hand mt-3 text-xl"
                    >
                      {line}
                    </motion.p>
                  ))}
                </>
              )}
              {s.type === "link" && s.linkUrl && (
                <a href={s.linkUrl} target="_blank" rel="noreferrer" className="bday-btn">
                  {s.linkLabel}
                </a>
              )}
              {s.type === "media" && s.mediaSrc && (
                s.mediaIsVideo ? (
                  <video src={s.mediaSrc} controls className="w-full rounded-lg" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.mediaSrc} alt="A surprise" className="w-full rounded-lg" />
                )
              )}
            </motion.div>

            {/* one soft celebratory flurry as it settles */}
            <Confetti count={reduced ? 0 : 24} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The cream box, rose ribbon, and slow-opening lid. */
function BigGiftBox({ stage }: { stage: GiftStage }) {
  const opening = stage === "opening";
  return (
    <svg viewBox="0 0 120 110" width="180" height="165" className="overflow-visible">
      {/* slow-opening lid */}
      <motion.g
        animate={opening ? { y: -46, rotate: -10, opacity: [1, 1, 0.55] } : { y: 0 }}
        transition={opening ? { duration: 1.4, ease: "easeInOut" } : { duration: 0.3 }}
        style={{ originX: "60px", originY: "38px" }}
      >
        <rect x="18" y="26" width="84" height="14" rx="3" fill="#f3ecdc" stroke="#c9808a" strokeWidth="2.4" />
      </motion.g>
      {/* box body */}
      <rect x="24" y="40" width="72" height="58" rx="4" fill="#f7efe1" stroke="#c9808a" strokeWidth="2.4" />
      {/* ribbon slides away when the cat pulls it */}
      <motion.rect
        x="55" y="40" width="10" height="58" fill="#c9808a"
        animate={stage === "pulling" || opening ? { x: 46, y: -14, rotate: 16, opacity: stage === "pulling" ? [1, 1, 0] : 0 } : {}}
        transition={{ duration: 0.8 }}
        style={{ originX: "60px", originY: "40px" }}
      />
      <motion.g
        animate={stage === "pulling" ? { x: 24, y: -22, rotate: 24, opacity: [1, 1, 0] } : opening ? { opacity: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ originX: "60px", originY: "26px" }}
      >
        <path d="M60 24c-9 0-14-4.6-12.6-9 1-3.2 7.6-2 12.6 9Z" fill="#c9808a" stroke="#a75d68" strokeWidth="1.6" />
        <path d="M60 24c9 0 14-4.6 12.6-9-1-3.2-7.6-2-12.6 9Z" fill="#c9808a" stroke="#a75d68" strokeWidth="1.6" />
        <circle cx="60" cy="24" r="3" fill="#a75d68" />
      </motion.g>
      {/* ribbon wiggle on the shake stage */}
      {stage === "shake" && (
        <motion.g animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 0.7 }} style={{ originX: "60px", originY: "26px" }}>
          <path d="M60 24c-9 0-14-4.6-12.6-9 1-3.2 7.6-2 12.6 9Z" fill="#c9808a" stroke="#a75d68" strokeWidth="1.6" />
        </motion.g>
      )}
    </svg>
  );
}
