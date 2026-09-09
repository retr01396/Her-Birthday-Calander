import type { SVGProps } from "react";

/**
 * Hand-drawn scrapbook SVG doodles.
 * All accept a `size` prop and inherit color via currentColor.
 */

type DoodleProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 32, ...props }: DoodleProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function DoodleHeart({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M16 27C10 22 4.5 17.5 4.5 11.8 4.5 7.9 7.4 5 11 5c2.2 0 4 1.1 5 3 1-1.9 2.8-3 5-3 3.6 0 6.5 2.9 6.5 6.8C27.5 17.5 22 22 16 27Z"
        fill="rgba(232,183,183,.4)"
      />
    </svg>
  );
}

export function DoodleBow({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M15.5 16C11 11.5 7 10.4 5.2 12.2c-1.8 1.8.4 5.4 5 7.4M16.5 16c4.5-4.5 8.5-5.6 10.3-3.8 1.8 1.8-.4 5.4-5 7.4"
        fill="rgba(232,183,183,.35)"
      />
      <circle cx="16" cy="16" r="2.6" fill="rgba(201,128,138,.55)" />
      <path d="M14.6 18.2 12 24M17.4 18.2 20 24" strokeWidth={1.5} />
    </svg>
  );
}

export function DoodleFlower({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <circle cx="16" cy="14" r="3" fill="rgba(217,179,108,.5)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="16"
          cy="6.5"
          rx="2.8"
          ry="4.5"
          fill="rgba(232,183,183,.45)"
          transform={`rotate(${a} 16 14)`}
        />
      ))}
      <path d="M16 17v11M16 23c2.4 0 4-1.6 4.4-3.4" />
    </svg>
  );
}

export function DoodleLock({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect
        x="8"
        y="14"
        width="16"
        height="12"
        rx="3"
        fill="rgba(91,66,50,.08)"
      />
      <path d="M11 14v-3.2A5 5 0 0 1 21 10.8V14" />
      <circle cx="16" cy="19" r="1.6" fill="currentColor" stroke="none" />
      <path d="M16 20.6v2.6" />
    </svg>
  );
}

export function DoodleSparkle({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M16 4c1 6 3.5 8.5 9.5 9.5C19.5 15 17 17.5 16 23.5 15 17.5 12.5 15 6.5 13.5 12.5 12.5 15 10 16 4Z"
        fill="rgba(217,179,108,.55)"
        stroke="none"
      />
      <path d="M25 22c.5 2.6 1.5 3.6 4 4-2.5.6-3.5 1.6-4 4-.5-2.4-1.5-3.4-4-4 2.5-.4 3.5-1.4 4-4Z" fill="rgba(232,183,183,.6)" stroke="none" />
    </svg>
  );
}

export function DoodleCoffee({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M7 13h15v7a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-7Z"
        fill="rgba(91,66,50,.1)"
      />
      <path d="M22 14h2.4a3 3 0 0 1 0 6H22" />
      <path d="M11 9c0-1.6 1.4-2 1.4-3.4M15.6 9c0-1.6 1.4-2 1.4-3.4" strokeWidth={1.5} />
    </svg>
  );
}

export function DoodleGift({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect x="6" y="13" width="20" height="13" rx="2" fill="rgba(232,183,183,.35)" />
      <rect x="4.5" y="9.5" width="23" height="5" rx="1.6" fill="rgba(201,128,138,.4)" />
      <path d="M16 9.5V26" />
      <path d="M16 9C13 9 11 7.4 11 5.8 11 4.6 12 4 13 4c1.8 0 3 2 3 5ZM16 9c3 0 5-1.6 5-3.2C21 4.6 20 4 19 4c-1.8 0-3 2-3 5Z" fill="rgba(201,128,138,.5)" />
    </svg>
  );
}

export function DoodleChocolate({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect x="6" y="9" width="20" height="17" rx="2.5" fill="rgba(91,66,50,.18)" />
      <path d="M6 15.5h20M6 20.5h20M13 9v17M19.5 9v17" strokeWidth={1.4} />
      <path d="M10 9c2-2.4 4.4-3.6 7.6-3.6 2.6 0 4.4 1 4.4 2.2 0 .9-.9 1.4-2.4 1.4" strokeWidth={1.5} />
    </svg>
  );
}

export function DoodlePlushie({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <ellipse cx="10.5" cy="7.5" rx="3.4" ry="4.4" fill="rgba(232,183,183,.4)" />
      <ellipse cx="21.5" cy="7.5" rx="3.4" ry="4.4" fill="rgba(232,183,183,.4)" />
      <circle cx="16" cy="15" r="9.5" fill="rgba(232,183,183,.3)" />
      <ellipse cx="16" cy="21.5" rx="6.5" ry="6" fill="rgba(251,246,236,.9)" />
      <circle cx="13" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <path d="M14.8 17c.8.7 1.6.7 2.4 0" strokeWidth={1.4} />
    </svg>
  );
}

export function DoodleLetter({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect x="5" y="9" width="22" height="15" rx="2" fill="rgba(251,246,236,.95)" />
      <path d="M5.5 10.5 16 18l10.5-7.5" />
      <path d="M19.5 5.5c.4 2 1.4 2.8 3.4 3-2 .4-3 1.3-3.4 3.3-.4-2-1.4-2.9-3.4-3.3 2-.2 3-1 3.4-3Z" fill="rgba(232,183,183,.6)" stroke="none" />
    </svg>
  );
}

export function DoodleRose({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <circle cx="16" cy="10" r="5.5" fill="rgba(201,128,138,.45)" />
      <path d="M16 5.5c-2.4 1-3.4 2.6-3 4.6M16 14.5c1.8-.6 2.8-1.8 3-3.6M12 9c1.4-.4 2.8-.2 4 .8" strokeWidth={1.3} />
      <path d="M15 15.5c-.6 4-1 8-3.5 11.5M17 15.5c.6 4 1 8 3.5 11.5" strokeWidth={1.5} />
      <path d="M14.5 21c-1.8-1.6-3.8-1.8-5.5-.8M17.5 21c1.8-1.6 3.8-1.8 5.5-.8" fill="rgba(168,183,154,.5)" strokeWidth={1.3} />
    </svg>
  );
}

export function DoodlePolaroid({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect x="5" y="5" width="22" height="22" rx="1.5" fill="rgba(251,246,236,.95)" />
      <rect x="7.5" y="7.5" width="17" height="13" fill="rgba(232,183,183,.4)" />
      <path d="M9 18l4-4 3.5 3.5L20 14l2.5 2.5" strokeWidth={1.4} />
      <circle cx="12.4" cy="11" r="1.4" fill="rgba(217,179,108,.7)" stroke="none" />
      <path d="M9.5 23h6" strokeWidth={1.3} />
    </svg>
  );
}

export function DoodleMoon({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M20 4.5A11.5 11.5 0 1 0 27.5 16 9 9 0 0 1 20 4.5Z"
        fill="rgba(217,179,108,.4)"
      />
      <path d="M9.5 8.5l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7L7.1 11l1.7-.7.7-1.8Z" fill="rgba(217,179,108,.7)" stroke="none" />
    </svg>
  );
}

export function DoodleStar({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path
        d="M16 4l3 7.2 7.8.6-6 5.1 1.9 7.6L16 20.4 9.3 24.5l1.9-7.6-6-5.1 7.8-.6L16 4Z"
        fill="rgba(217,179,108,.45)"
      />
    </svg>
  );
}

export function DoodleCake({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <path d="M7 26h18v-7c0-2-1.6-3.5-3.5-3.5h-11C8.6 15.5 7 17 7 19v7Z" fill="rgba(243,215,213,.8)" />
      <path d="M5 26h22" strokeWidth={2} />
      <path d="M16 15.5V12" stroke="var(--bday-rose, #c9808a)" strokeWidth={1.6} />
      <path d="M16 9.5c1.2-1.2 1.2-2.6 0-4-1.2 1.4-1.2 2.8 0 4Z" fill="rgba(217,179,108,.8)" stroke="none" />
      <path d="M7 21.5c1.8 1.4 3.6 1.4 5.4 0 1.8 1.4 3.6 1.4 5.4 0 1.8 1.4 3.6 1.4 5.4 0" strokeWidth={1.4} />
    </svg>
  );
}

export function DoodleBalloon({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <ellipse cx="16" cy="11" rx="7" ry="8.4" fill="rgba(232,183,183,.45)" />
      <path d="M16 19.4c-.7 1-1.4 1.4-1.6 2.4M16 22c-1 2.4 1.4 3.4.4 6" strokeWidth={1.3} />
      <path d="M13 8.4c.5-1.4 1.7-2.4 3.2-2.6" strokeWidth={1.2} />
    </svg>
  );
}

export function DoodleMusic({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <circle cx="9.5" cy="22.5" r="3.2" fill="rgba(201,128,138,.45)" />
      <circle cx="21.5" cy="20.5" r="3.2" fill="rgba(201,128,138,.45)" />
      <path d="M12.7 22.5V8.5l12-2.5v14.5" />
      <path d="M12.7 12l12-2.5" strokeWidth={1.4} />
    </svg>
  );
}

export function DoodleWindow({ size = 32, ...p }: DoodleProps) {
  return (
    <svg {...base({ size, ...p })}>
      <rect x="6" y="5" width="20" height="22" rx="2" fill="rgba(91,66,50,.1)" />
      <path d="M16 5v22M6 16h20" />
      <path d="M6 5l3 3M26 5l-3 3" strokeWidth={1.4} />
    </svg>
  );
}
