# Adding your real photos to the Memory scrapbook (Day 8)

Three steps, no code changes anywhere else:

## 1. Drop your photos in this folder

```
public/birthday/photos/
```

Any of these work: `photo-1.jpg`, `memory.jpg`, `IMG_1234.png` — portrait,
landscape or square. Photos are displayed with `object-fit: cover`, so they
are never stretched or distorted.

## 2. List them in the config

Open `src/lib/birthday/config.ts` and edit the `MEMORIES` block:

```ts
export const MEMORIES = {
  heading: "Our Little Scrapbook",
  photos: [
    {
      image: "/birthday/photos/photo-1.jpg",   // ← your file name
      caption: "our first coffee date ♡",       // ← your caption
      date: "September 3",                      // ← optional
      tilt: -3,                                 // ← optional polaroid tilt
    },
    // …one entry per photo
  ],
};
```

## 3. Reload

The dev server picks up `public/` files immediately — just refresh the page.
If a photo listed in the config doesn't exist (typo, not uploaded yet), the
polaroid gracefully shows the illustrated placeholder instead of breaking.

Tip: keep image files reasonably sized (~≤1 MB) so the page stays fast on
mobile data.
