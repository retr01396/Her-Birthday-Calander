import { cn } from "@/lib/utils";

/**
 * Mochi — the one recurring cat mascot of "13 Little Days".
 * A kawaii cream cat with dusty-pink ears; every scene reuses this
 * component with a `pose` so the same character travels the journey.
 */

export type CatPose =
  | "sit"
  | "carry-bouquet"
  | "carry-box"
  | "cafe"
  | "drag-plushie"
  | "gift"
  | "deliver-letter"
  | "roses"
  | "hug-heart"
  | "mystery"
  | "stargaze"
  | "cover-envelope"
  | "party";

interface CatProps {
  pose?: CatPose;
  size?: number;
  className?: string;
}

/** Small helpers so every pose shares one body recipe. */
function Eyes({ closed = false }: { closed?: boolean }) {
  if (closed)
    return (
      <>
        <path d="M-8 -2 q2.4 2.4 4.8 0" className="stroke-[2.2]" />
        <path d="M3.2 -2 q2.4 2.4 4.8 0" className="stroke-[2.2]" />
      </>
    );
  return (
    <>
      <circle cx="-5.6" cy="-2" r="1.9" fill="#3f2d22" stroke="none" />
      <circle cx="5.6" cy="-2" r="1.9" fill="#3f2d22" stroke="none" />
      <circle cx="-5" cy="-2.7" r="0.6" fill="#fff" stroke="none" />
      <circle cx="6.2" cy="-2.7" r="0.6" fill="#fff" stroke="none" />
    </>
  );
}

function Whiskers() {
  return (
    <g stroke="#a58a74" strokeWidth="1.1" strokeLinecap="round">
      <path d="M-10 1.5 l-4.5 -1.2" />
      <path d="M-10 3.5 l-4.5 1.2" />
      <path d="M10 1.5 l4.5 -1.2" />
      <path d="M10 3.5 l4.5 1.2" />
    </g>
  );
}

function Blush() {
  return (
    <g fill="rgba(232,150,160,.45)" stroke="none">
      <ellipse cx="-8.4" cy="1.8" rx="2" ry="1.2" />
      <ellipse cx="8.4" cy="1.8" rx="2" ry="1.2" />
    </g>
  );
}

/** Oversized items the cat can hold; drawn in front at head height. */
function Prop({ pose }: { pose: CatPose }) {
  switch (pose) {
    case "carry-bouquet":
      return (
        <g transform="translate(0 2)">
          {[-10, -4, 3, 10].map((x, i) => (
            <g key={i} transform={`translate(${x} ${-i % 2 ? 3 : -1})`}>
              <circle r="5.4" fill="#f3d7d5" stroke="#c9808a" strokeWidth="1.6" />
              <circle r="2.2" fill="#d9b36c" stroke="#a58a3e" strokeWidth="1" />
              <path d={`M0 5.5 v${6 + (i % 2) * 2}`} stroke="#a8b79a" strokeWidth="1.6" />
            </g>
          ))}
          <path d="M-13 8 q13 8 26 0" stroke="#c9808a" strokeWidth="2" fill="none" />
        </g>
      );
    case "carry-box":
      return (
        <g transform="translate(0 4)">
          <rect x="-13" y="-2" width="26" height="13" rx="2" fill="#8a5a3c" stroke="#5b4232" strokeWidth="1.6" />
          <rect x="-14.5" y="-6" width="29" height="5" rx="1.6" fill="#a06a48" stroke="#5b4232" strokeWidth="1.6" />
          <path d="M0 -6 V11" stroke="#e8b7b7" strokeWidth="3" />
          <path d="M0 -6 c-4 0 -6 -2 -5.4 -4 c.5 -1.6 4 -1 5.4 4 Z" fill="#e8b7b7" stroke="#c9808a" strokeWidth="1.2" />
          <path d="M0 -6 c4 0 6 -2 5.4 -4 c-.5 -1.6 -4 -1 -5.4 4 Z" fill="#e8b7b7" stroke="#c9808a" strokeWidth="1.2" />
        </g>
      );
    case "hug-heart":
      return (
        <g transform="translate(0 4)">
          <path
            d="M0 12 C-9 5 -15 0.5 -15 -5.5 C-15 -10.5 -11.4 -14 -7 -14 c-2.8 0 -5 -2.4 -5 -5.4 0 -3.6 2.9 -6.6 7 -6.6 2.6 0 4.4 1.2 5 3.4 .6 -2.2 2.4 -3.4 5 -3.4 4.1 0 7 3 7 6.6 0 3 -2.2 5.4 -5 5.4 4.4 0 8 3.5 8 8.5 0 6 -6 10.5 -15 17.5 Z"
            transform="scale(.62) translate(0 2)"
            fill="#e8b7b7"
            stroke="#c9808a"
            strokeWidth="2"
          />
        </g>
      );
    case "deliver-letter":
      return (
        <g transform="translate(9 3) rotate(8)">
          <rect x="-9" y="-7" width="18" height="13" rx="1.5" fill="#fdf8ef" stroke="#c9808a" strokeWidth="1.6" />
          <path d="M-9 -6 L0 1 L9 -6" stroke="#c9808a" strokeWidth="1.4" fill="none" />
          <circle cx="7" cy="-9" r="1.6" fill="#c9808a" stroke="none" />
        </g>
      );
    case "roses":
      return (
        <g transform="translate(-11 1)">
          {[-3, 2].map((y, i) => (
            <g key={i} transform={`translate(0 ${y})`}>
              <circle r="4.6" fill="#c9808a" stroke="#a75d68" strokeWidth="1.4" />
              <path d="M-2.5 -1 q2.5 -2.4 5 0 M-2 1.6 q2 -1.8 4 0" stroke="#7d4a53" strokeWidth="1" fill="none" />
              <path d="M0 4.6 v7" stroke="#a8b79a" strokeWidth="1.5" />
            </g>
          ))}
        </g>
      );
    case "party":
      return (
        <g transform="translate(0 -22)">
          <path d="M0 -9 L7 7 H-7 Z" fill="#e8b7b7" stroke="#c9808a" strokeWidth="1.6" />
          <circle cx="0" cy="-9" r="2.4" fill="#d9b36c" stroke="#a58a3e" strokeWidth="1" />
          <path d="M-4 -2 l8 0 M-2.4 3 l4.8 0" stroke="#f7efe1" strokeWidth="1.6" />
        </g>
      );
    case "cover-envelope":
    case "mystery":
    case "gift":
      return (
        <g transform="translate(0 6)">
          <rect x="-14" y="-6" width="28" height="15" rx="2" fill="#f7efe1" stroke="#c9808a" strokeWidth="1.8" />
          <path d="M0 -6 V9" stroke="#c9808a" strokeWidth="2.4" />
          <path d="M-14 -6 l6 15 M14 -6 l-6 15" stroke="#c9808a" strokeWidth="1.4" />
        </g>
      );
    case "drag-plushie":
      return (
        <g transform="translate(13 5)">
          <circle cx="0" cy="-6" r="6.4" fill="#f3d7d5" stroke="#c9808a" strokeWidth="1.6" />
          <ellipse cx="-5" cy="-11" rx="2.6" ry="3.4" fill="#f3d7d5" stroke="#c9808a" strokeWidth="1.4" />
          <ellipse cx="5" cy="-11" rx="2.6" ry="3.4" fill="#f3d7d5" stroke="#c9808a" strokeWidth="1.4" />
          <ellipse cx="0" cy="3" rx="5.4" ry="5" fill="#f3d7d5" stroke="#c9808a" strokeWidth="1.6" />
        </g>
      );
    default:
      return null;
  }
}

/** Ground/side props for scene-specific poses (cafe, stargaze). */
function SceneProp({ pose }: { pose: CatPose }) {
  switch (pose) {
    case "cafe":
      return (
        <g transform="translate(-24 8)">
          <path d="M-8 -6 h14 v6 a7 7 0 0 1 -7 7 h0 a7 7 0 0 1 -7 -7 v-6 Z" fill="#fbf6ec" stroke="#5b4232" strokeWidth="1.6" />
          <path d="M6 -4.5 h2.6 a2.6 2.6 0 0 1 0 5.2 H6" fill="none" stroke="#5b4232" strokeWidth="1.4" />
          <ellipse cx="-1" cy="-6" rx="7" ry="1.4" fill="#8a5a3c" stroke="#5b4232" strokeWidth="1.2" />
        </g>
      );
    case "stargaze":
      return null;
    default:
      return null;
  }
}

export function BirthdayCat({ pose = "sit", size = 200, className }: CatProps) {
  return (
    <svg
      viewBox="-40 -50 80 110"
      width={size}
      height={size * 1.35}
      className={cn("max-w-full", className)}
      role="img"
      aria-label="Mochi the cat"
      style={{ overflow: "visible" }}
    >
      {/* tail */}
      <path
        d="M20 26 q14 -2 12 -14 q-1.5 -7 -7 -6"
        fill="none"
        stroke="#3f2d22"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* body */}
      <ellipse cx="0" cy="18" rx="19" ry="16" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2.2" />
      {/* front paws raised for gift/envelope/heart poses */}
      {(pose === "mystery" || pose === "gift" || pose === "cover-envelope") && (
        <>
          <ellipse cx="-8" cy="6" rx="4.4" ry="5.4" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2" transform="rotate(18 -8 6)" />
          <ellipse cx="8" cy="6" rx="4.4" ry="5.4" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2" transform="rotate(-18 8 6)" />
        </>
      )}
      {/* head */}
      <g transform="translate(0 -8)">
        {/* ears */}
        <path d="M-15 -8 L-19 -21 L-7 -14 Z" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 -8 L19 -21 L7 -14 Z" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2" strokeLinejoin="round" />
        <path d="M-15.6 -11 L-17.4 -17.4 L-12 -14 Z" fill="#e8b7b7" stroke="none" />
        <path d="M15.6 -11 L17.4 -17.4 L12 -14 Z" fill="#e8b7b7" stroke="none" />
        {/* face */}
        <circle cx="0" cy="0" r="17" fill="#fdf8ef" stroke="#3f2d22" strokeWidth="2.2" />
        <Whiskers />
        <Blush />
        <Eyes closed={pose === "hug-heart" || pose === "stargaze" || pose === "party"} />
        <path d="M0 2.4 c-1.6 0 -2.4 1 -2.4 1.8 0 1.2 1.4 2.4 2.4 2.4 1 0 2.4 -1.2 2.4 -2.4 0 -.8 -.8 -1.8 -2.4 -1.8 Z" fill="#e896a0" stroke="#3f2d22" strokeWidth="1.2" />
        <path d="M0 6.6 v1.6 M0 8.2 q-2 1.8 -3.6 .4 M0 8.2 q2 1.8 3.6 .4" stroke="#3f2d22" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>
      {/* scene prop behind paws */}
      <SceneProp pose={pose} />
      {/* held prop */}
      <Prop pose={pose} />
    </svg>
  );
}
