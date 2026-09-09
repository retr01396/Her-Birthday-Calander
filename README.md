# 13 Little Days ♡

A handmade, interactive birthday scrapbook — a 13-day journey from
September 1 to September 13, ending in a birthday finale and a little
cozy room full of surprises.

Built with Next.js (App Router), React, Tailwind and Framer Motion.
No database, no backend services — everything is static content plus
client-side magic.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects straight to `/birthday`.

## How the days unlock

Days 1–9 are available immediately. Days 10–13 unlock automatically on
their real dates in **Asia/Kolkata** time. Future days are locked on the
server (middleware + page-level check), so their content can never be
revealed by typing the URL early.

## Personalizing

Almost all personal content lives in one file:

- **`src/lib/birthday/config.ts`** — day messages, the love letter, the
  big birthday letter, photo captions, music, and the final surprise.

Photos: drop images into `public/birthday/photos/` and list them in
`MEMORIES.photos` inside the config (see `public/birthday/photos/README.md`).

Music: replace `public/birthday/audio/lofi.mp3` (plays on loop).

## Deploying

Deploys as a normal Next.js app (e.g. Vercel) with zero environment
variables required.
