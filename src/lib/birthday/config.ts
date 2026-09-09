/**
 * ═══════════════════════════════════════════════════════════════
 *  13 LITTLE DAYS — CONTENT CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 *
 *  This is the ONLY file you need to edit to personalize the
 *  experience. Everything below is placeholder content — replace
 *  the words, photos and links with your own.
 *
 *  Do NOT touch the UI components to change a message; change it
 *  here and it flows everywhere.
 */

// ── The journey ────────────────────────────────────────────────
export const JOURNEY = {
  /** The month of the birthday journey */
  month: 9, // September
  /** First day of the journey */
  startDay: 1,
  /** Birthday day (final day) */
  birthdayDay: 13,
  year: new Date().getFullYear(),
  title: "13 Little Days",
  timezone: "Asia/Kolkata", // recipient's local timezone — used for unlock logic
} as const;

// ── Intro screen ───────────────────────────────────────────────
export const INTRO = {
  lines: [
    "This isn't just a website.",
    "It's 13 little days I made for you.",
    "September 1 → September 13 ♡",
  ],
  button: "START THE JOURNEY ♡",
};

// ── The 13 days ────────────────────────────────────────────────
export type DayKind =
  | "flowers"
  | "chocolates"
  | "coffee"
  | "plushie"
  | "gift"
  | "letter"
  | "roses"
  | "memory"
  | "heart"
  | "mystery"
  | "moon"
  | "sealed"
  | "birthday";

export interface DayConfig {
  /** Day of September (1–13) */
  day: number;
  /** Calendar label, e.g. "Flowers" */
  title: string;
  /** Unique scene key — picks the illustrated scene component */
  kind: DayKind;
  /** Short scrapbook caption shown under the calendar tile */
  caption: string;
  /** Headline shown at the top of the day page */
  heading: string;
  /** The main personal message for the day (EDIT ME) */
  message: string;
  /** Optional small handwritten note in the corner (EDIT ME) */
  note?: string;
}

export const DAYS: DayConfig[] = [
  {
    day: 1,
    title: "Flowers",
    kind: "flowers",
    caption: "the very first one",
    heading: "Day 01 — Flowers",
    message: "A little something to start.",
    note: "for you, of course ♡",
  },
  {
    day: 2,
    title: "Chocolates",
    kind: "chocolates",
    caption: "sweet, like you",
    heading: "Day 02 — Chocolates",
    message:
      "I couldn't hand these to you in person, so I asked a small cat to help.",
    note: "eat them slowly ♡",
  },
  {
    day: 3,
    title: "Coffee",
    kind: "coffee",
    caption: "our kind of morning",
    heading: "Day 03 — Coffee",
    message:
      "One cup for you, one for me. Even from far away, this is our table.",
    note: "still warm ♡",
  },
  {
    day: 4,
    title: "Plushie",
    kind: "plushie",
    caption: "softest thing here",
    heading: "Day 04 — Plushie",
    message:
      "He's very fluffy and slightly dramatic. He'll keep you company when I can't.",
    note: "his name is up to you",
  },
  {
    day: 5,
    title: "Little Gift",
    kind: "gift",
    caption: "tied with ribbon",
    heading: "Day 05 — A Little Gift",
    message: "I wrapped this by hand. (The cat supervised.)",
    note: "open gently ♡",
  },
  {
    day: 6,
    title: "Love Letter",
    kind: "letter",
    caption: "handwritten, mostly",
    heading: "Day 06 — A Love Letter",
    message: "", // rendered from LETTERS.loveLetter below
    note: "read it twice ♡",
  },
  {
    day: 7,
    title: "Roses",
    kind: "roses",
    caption: "they don't wilt here",
    heading: "Day 07 — Roses",
    message: "These ones never wilt. Like some other things I know.",
    note: "dozen, obviously",
  },
  {
    day: 8,
    title: "Memory",
    kind: "memory",
    caption: "polaroids & tape",
    heading: "Day 08 — Memory",
    message: "A page from our scrapbook. Click a photo to look closer.",
    note: "more to add ♡",
  },
  {
    day: 9,
    title: "Heart",
    kind: "heart",
    caption: "careful, it's big",
    heading: "Day 09 — Heart",
    message: "We're getting closer... ♡",
    note: "4 more sleeps",
  },
  {
    day: 10,
    title: "Mystery Gift",
    kind: "mystery",
    caption: "ribbon-wrapped secret",
    heading: "Day 10 — Mystery Gift",
    message:
      "No hints. No shaking the box. You'll find out with everything else.",
    note: "be patient ♡",
  },
  {
    day: 11,
    title: "Moon & Stars",
    kind: "moon",
    caption: "same sky, both of us",
    heading: "Day 11 — Moon & Stars",
    message:
      "When you miss me tonight, look up. We're under the same one.",
    note: "make a wish",
  },
  {
    day: 12,
    title: "Sealed Letter",
    kind: "sealed",
    caption: "do NOT open early",
    heading: "Day 12 — Sealed Letter",
    message: "OPEN TOMORROW ♡",
    note: "I mean it",
  },
  {
    day: 13,
    title: "Birthday",
    kind: "birthday",
    caption: "the whole point ♡",
    heading: "Day 13 — Birthday",
    message: "You made it.",
    note: "happy birthday",
  },
];

// ── Letters (easily replaceable) ───────────────────────────────

/**
 * ★ MAIN BIRTHDAY LETTER ★
 * Write your own personal letter here. Every paragraph renders in order,
 * no truncation, fully scrollable on mobile. This placeholder shows until
 * you replace it.
 */
export const mainBirthdayLetter = {
  title: "The Big Birthday Letter",
  greeting: "Happy birthday, my love,",
  paragraphs: [
    "[Write your real letter here — paragraph one.]",
    "[Paragraph two. Add as many as you like; the letter grows and stays readable, scrolling naturally on phones.]",
  ],
  closing: "Happy birthday ♡",
  signature: "— yours",
};

export const LETTERS = {
  loveLetter: {
    greeting: "My dearest,",
    paragraphs: [
      "Six days in, and you've opened every little door I made for you. I hope you're smiling — that was the whole point of all this.",
      "I wanted each of these days to feel like a small hand on your shoulder, reminding you that someone out here thinks you're wonderful.",
      // "[Replace this paragraph with your own words.]",
    ],
    closing: "Yours, always ♡",
    signature: "— me",
  },
  birthdayLetter: mainBirthdayLetter,
};

// ── Day 8 — Memory scrapbook (replace with real photos) ────────
export interface MemoryPhoto {
  /** Path under /public, or any URL. Missing files fall back to the
   *  illustrated placeholder automatically. */
  image: string;
  caption: string;
  /** Optional date printed under the caption */
  date?: string;
  /** Optional rotation in degrees for scrapbook feel */
  tilt?: number;
}

/**
 * ★ YOUR POLAROIDS ★
 * 1. Drop your photos into  public/birthday/photos/
 * 2. Add one entry here per photo (path + caption + optional date)
 * That's it — the scrapbook picks them up automatically.
 * Keep the placeholder SVGs (or delete entries) until then.
 */
export const MEMORIES: { heading: string; photos: MemoryPhoto[] } = {
  heading: "Our Little Scrapbook",
  photos: [
    {
      image: "/birthday/photos/photo-1.jpg",
      caption: "",
      tilt: -3,
    },
    {
      image: "/birthday/photos/photo-2.jpg",
      caption: "",
      tilt: 2,
    },
    {
      image: "/birthday/photos/photo-3.jpg",
      caption: "",
      tilt: -2,
    },
  ],
};

// ── Our Little World — music player ────────────────────────────
export interface Track {
  title: string;
  artist: string;
  src: string;
}

export const MUSIC = {
  heading: "Vintage Music Player",
  hint: "press play — it won't start on its own ♡",
  /** loops forever until the site is closed */
  loop: true,
  playlist: [
    {
      title: "our little song",
      artist: "lofi ♡",
      src: "/birthday/audio/lofi.mp3",
    },
  ] as Track[],
};

// ── The BIG gift box (final surprise) ──────────────────────────
export const BIG_GIFT = {
  tag: "for you ♡",
  revealTitle: "One more thing...",
  /**
   * The REAL surprise. Pick ONE type below and fill it in.
   *  - "message": a hidden letter / announcement
   *  - "link":    an external page (date booking, video, etc.)
   *  - "media":   a photo or video shown in the box
   */
  surprise: {
    type: "message" as "message" | "link" | "media",
    // type: "message"
    heading: "The Real Surprise",
    lines: [
      "[Replace this with the real surprise —]",
      "[a date invitation, an announcement,]",
      "[whatever you want it to be ♡]",
    ],
    // type: "link"
    linkUrl: "",
    linkLabel: "Open it ♡",
    // type: "media"
    mediaSrc: "",
    mediaIsVideo: false,
  },
};

// ── Little world room copy ─────────────────────────────────────
export const WORLD = {
  title: "Our Little World",
  hint: "click around the room — everything here is yours",
  hotspots: {
    photoWall: { label: "Photo Wall", message: "Every photo here is a day I'd relive." },
    birthdayLetter: { label: "Birthday Letter", message: "" }, // renders LETTERS.birthdayLetter
    musicPlayer: { label: "Music Player", message: "" }, // renders MUSIC
    coffeeMug: { label: "Coffee Mug", message: "Still warm. Just like always ♡" },
    plushie: { label: "Plushie", message: "Hug received. Hug returned ♡" },
    nightWindow: { label: "Night Window", message: "Same moon, same sky, same me." },
    giftBox: { label: "The Big Gift", message: "" }, // renders BIG_GIFT flow
  },
};

// ── Day 13 finale copy ─────────────────────────────────────────
export const FINALE = {
  opening: "You made it.",
  countdown: [3, 2, 1],
  headline: "HAPPY BIRTHDAY, MY LOVE ♡",
  subheading:
    "I wanted to give you something that would last longer than a single day.",
  enterWorld: "Enter our little world ♡",
};

// ── Day 7 — the rose cinematic ─────────────────────────────────
export const ROSE_CINEMATIC = {
  wait: "wait...",
  after: "Some flowers are worth making a little dramatic. ♡",
};

// ── Day 10 — the mystery box refuses ───────────────────────────
export const MYSTERY = {
  dots: "...",
  refuse: "Not this one... not yet. ♡",
};

// ── Day 12 — the sealed letter holds the line ──────────────────
export const SEALED = {
  notYet: "Not yet.",
  tomorrow: "Open tomorrow ♡",
};

// ── World — extra hotspot copy ─────────────────────────────────
export const WORLD_HOTSPOT_EXTRAS = {
  coffeeHint: "tap the mug ♡",
  nightHint: "tap to change the time ♡",
  giftHint: "tap to open ♡",
  cakeHint: "tap the candles ♡",
  cakeCandlesOut: "wish granted ♡",
};
