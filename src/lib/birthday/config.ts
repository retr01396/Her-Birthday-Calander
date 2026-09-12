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
    caption: "starting soft",
    heading: "Day 01 — Flowers",
    message: "had to start with flowers. those are just the rules.",
    note: "more where this came from ♡",
  },
  {
    day: 2,
    title: "Chocolates",
    kind: "chocolates",
    caption: "you know which one i'd steal",
    heading: "Day 02 — Chocolates",
    message:
      "no occasion. day two just felt like it should be sweet. like someone else i know.",
    note: "eat one for me ♡",
  },
  {
    day: 3,
    title: "Coffee",
    kind: "coffee",
    caption: "you, me, coffee",
    heading: "Day 03 — Coffee",
    message:
      "imagine we're at the café and i keep stealing sips of yours. because i would.",
    note: "yours has the heart on it ♡",
  },
  {
    day: 4,
    title: "Plushie",
    kind: "plushie",
    caption: "softest thing here",
    heading: "Day 04 — Plushie",
    message:
      "his whole job is to be hugged when i'm not there. he takes it very seriously.",
    note: "name him something silly. he can't object",
  },
  {
    day: 5,
    title: "Little Gift",
    kind: "gift",
    caption: "wrapped it myself",
    heading: "Day 05 — A Little Gift",
    message: "wrapped it myself. the cat 'helped'.",
    note: "it's small but it took forever ♡",
  },
  {
    day: 6,
    title: "Love Letter",
    kind: "letter",
    caption: "handwritten, mostly",
    heading: "Day 06 — A Love Letter",
    message: "", // rendered from LETTERS.loveLetter below
    note: "take your time with this one ♡",
  },
  {
    day: 7,
    title: "Roses",
    kind: "roses",
    caption: "they don't wilt here",
    heading: "Day 07 — Roses",
    message: "got you the kind that don't die. felt appropriate.",
    note: "a dozen, obviously",
  },
  {
    day: 8,
    title: "Memory",
    kind: "memory",
    caption: "polaroids & tape",
    heading: "Day 08 — Memory",
    message: "a few of my favorites. tap them, they like the attention ♡",
    note: "more to add later",
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
      "you can look. no shaking though. i know how you are.",
    note: "i can hear you thinking about it",
  },
  {
    day: 11,
    title: "Moon & Stars",
    kind: "moon",
    caption: "same sky, both of us",
    heading: "Day 11 — Moon & Stars",
    message:
      "same moon out my window too. wave if you're up ♡",
    note: "look up tonight, for real",
  },
  {
    day: 12,
    title: "Sealed Letter",
    kind: "sealed",
    caption: "do NOT open early",
    heading: "Day 12 — Sealed Letter",
    message: "OPEN TOMORROW ♡",
    note: "i'm watching. no peeking",
  },
  {
    day: 13,
    title: "Birthday",
    kind: "birthday",
    caption: "the whole point ♡",
    heading: "Day 13 — Birthday",
    message: "You made it.",
    note: "the big one ♡",
  },
];

// ── Letters (easily replaceable) ───────────────────────────────

/**
 * ★ MAIN BIRTHDAY LETTER ★
 * Write your own personal letter here. Every paragraph renders in order,
 * no truncation, fully scrollable on mobile.
 */
export const mainBirthdayLetter = {
  title: "Happy birthday to my favourite person everrr ❤️",
  greeting: "",
  paragraphs: [
    "istg i genuinely dont even know where to start because theres so much i wanna say to you and i know im probably gonna yap for no reason but idc its ur birthday so u have to read all of this 😭❤️ first of all i just want u to know how fucking grateful i am that i have u in my life am not joking u Gng like genuinely out of all the people in this world somehow i got u and thats still something i think about sometimes because how tf did that even happen 😭 righ so many diff tastes and we still ended up together hehe and vave u become such a huge part of my life and i honestly cant imagine things being the same without u every wallpaper every gifts every passwords everything is uuuu vave fr can’t live without u anymore ur literally the person i wanna tell everything to the person i wanna talk to when something happens the person i wanna annoy for absolutely no reason and somehow the person i still wanna be around even after we pissed each other off 💀am too nonchalant to be pissed thoooooo and ik we had our fair share of arguments and stupid fights and moments where we both probably wanted to throw each other into a wall I never wanted thooo u wud have nigga😭 but even after all of that i still wouldnt change what we have for anything because at the end of the day its still mah babyyyy ur still the person i choose and the person i wanna keep choosing in every universe u are mah soulmate its decided we marrying okaaaaaaa",
    "we had good days bad days random ass days where neither of us knows what tf is happening but every single one of those moments means something to me because they are ours uk like I even love the silence between us hope u get it idk if that even makes sense but yeah 🥀😭✌🏻i genuinely hope u know how much you mean to me because sometimes i feel like i dont say it enough i might joke around all the time and act like i dont care and say dumb shit and annoy u a lot  24/7 but i care about you more than i probably know how to explain like way moree than someone i never want to lose and someone i genuinely want to see happy even if sometimes i have absolutely no idea how to make that happen uk cuase i hurt u so bad vave ik am so sorry i want u to get everything u want in life i want u to be proud of yourself i want u to accomplish all the things u talk about i want you to have days where ur genuinely happy vave both in life and in our relationship and i want u to always know that theres someone here who believes in you even when u dont believe in yourself ill be here to cheer u up be with u and talk to u vave make u laugh",
    "and today is literally YOUR day so forget everything else for a second forget the stress forget the annoying people forget whatever has been bothering u and just enjoy urself u deserve to feel special today because u genuinely are special to me i hope u realise how loved u are and how many people care about u but especially i hope u realise how much i care about you because istg sometimes i could write an entire essay about u and still feel like i havent said enough 😭 i love all the little things about u too the way you talk the random things u say the retarded jokes the way u get pissed lol  the way u react to things the little conversations we have that probably mean nothing to anyone else but somehow mean everything to me even the most normal days with u can end up becoming memories that i know im gonna look back on later and smile at fr vave and thats probably one of my favourite things about us it doesnt always have to be some huge romantic moment or some movie shit sometimes its literally just us talking about the most random bullshit at some random time and thats enough for me i could genuinely keep going forever but then this would become a whole fucking novel and i already know ur gonna be like bro shut up 😭 so ill stop before i make u wait more and get u mad  just know that i love u so fucking much and im genuinely thankful for every memory every conversation every stupid argument every laugh every late night every random moment and everything in between i wouldnt trade what we have for anything ur my person ur my favourite idiot and ur someone i want in my life for a very very long time",
    "so happy birthday MAH SWEET SWEET PWINCESSS MWUAHHHHH 😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚😚LOVE UUUUUUUUU i hope today is everything u want it to be and i hope u know that u deserve every bit of happiness that comes ur way no matter how old u get UR 20 ur unc now lol😭😭😭😭 ill always be grateful that i got to meet u and that i get to call u mine i love u more than i can properly put into words and istg thats probably never gonna change happy birthday again my BABBYYYY GULL 😭😭😭😭😭😭 i hope u have the best fucking day everrr sorry for making u wait a lot 😭😭😭😭😭😭😭😭😭😭😭😭😭😭😭"
  ],
  closing: "love youuuuuuuuu",
  signature: "— your favourite idiot",
};

export const LETTERS = {
  loveLetter: {
    greeting: "hey you,",
    paragraphs: [
      "if you're reading this, you've made it to day six. which means you've been clicking around this little site i made you — and honestly, that's all i wanted.",
      "i'm not great at saying sappy stuff out loud. i overthink it, it comes out weird, we laugh. so i figured i'd write it down where i can't fumble it.",
      "you make regular days feel like something worth remembering. that's it. that's the whole letter. the rest is hiding in the next seven days ♡",
    ],
    closing: "yours, obviously ♡",
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
  hint: "our song — it's been playing since you got here ♡",
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
  hint: "go on, poke around. everything in here is yours ♡",
  hotspots: {
    photoWall: { label: "Photo Wall", message: "i keep coming back to these. now you can too." },
    birthdayLetter: { label: "Birthday Letter", message: "" }, // renders LETTERS.birthdayLetter
    musicPlayer: { label: "Music Player", message: "" }, // renders MUSIC
    coffeeMug: { label: "Coffee Mug", message: "made it how you like it. don't tell me i got it wrong" },
    plushie: { label: "Plushie", message: "he's been waiting here all week. go on ♡" },
    nightWindow: { label: "Night Window", message: "it's always night in here. i don't make the rules ♡" },
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
  enterWorld: "there's one more room for you ♡",
};

// ── Day 7 — the rose cinematic ─────────────────────────────────
export const ROSE_CINEMATIC = {
  wait: "wait...",
  after: "okay maybe i went overboard. you're worth overboard ♡",
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
