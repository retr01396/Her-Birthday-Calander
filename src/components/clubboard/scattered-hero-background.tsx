"use client"

import type { Club } from "@/generated/prisma/client"
import { ClubMark } from "@/components/clubboard/club-identity"

interface ScatteredLogo {
  clubIndex: number
  position: string
  tilt: string
  size: string
  floatDelay: string
  floatDuration: string
}

const layout: ScatteredLogo[] = [
  { clubIndex: 0, position: "left-[3%] top-[9%]", tilt: "-rotate-6", size: "h-16 w-16 sm:h-20 sm:w-20", floatDelay: "0s", floatDuration: "6s" },
  { clubIndex: 1, position: "left-[16%] top-[58%]", tilt: "rotate-12", size: "h-14 w-14 sm:h-16 sm:w-16", floatDelay: "1.1s", floatDuration: "7s" },
  { clubIndex: 2, position: "left-[27%] top-[6%]", tilt: "rotate-3", size: "h-12 w-12 sm:h-14 sm:w-14", floatDelay: "2s", floatDuration: "5.5s" },
  { clubIndex: 3, position: "right-[25%] top-[7%]", tilt: "-rotate-3", size: "h-14 w-14 sm:h-16 sm:w-16", floatDelay: "0.6s", floatDuration: "6.5s" },
  { clubIndex: 4, position: "right-[5%] top-[14%]", tilt: "rotate-6", size: "h-16 w-16 sm:h-20 sm:w-20", floatDelay: "1.6s", floatDuration: "5.8s" },
  { clubIndex: 5, position: "right-[15%] top-[59%]", tilt: "-rotate-12", size: "h-12 w-12 sm:h-14 sm:w-14", floatDelay: "0.3s", floatDuration: "6.2s" },
  { clubIndex: 6, position: "right-[2%] top-[79%]", tilt: "rotate-6", size: "h-14 w-14 sm:h-16 sm:w-16", floatDelay: "2.4s", floatDuration: "7.2s" },
  { clubIndex: 7, position: "left-[5%] top-[82%]", tilt: "rotate-12", size: "h-12 w-12 sm:h-14 sm:w-14", floatDelay: "1.3s", floatDuration: "5.4s" },
  { clubIndex: 8, position: "left-[38%] top-[82%]", tilt: "-rotate-6", size: "h-10 w-10 sm:h-12 sm:w-12", floatDelay: "0.8s", floatDuration: "6.8s" },
  { clubIndex: 9, position: "right-[37%] top-[4%]", tilt: "-rotate-6", size: "h-10 w-10 sm:h-12 sm:w-12", floatDelay: "2.8s", floatDuration: "5.9s" },
  { clubIndex: 10, position: "left-[8%] top-[35%]", tilt: "rotate-3", size: "h-11 w-11 sm:h-14 sm:w-14", floatDelay: "1.8s", floatDuration: "6.4s" },
  { clubIndex: 11, position: "left-[22%] top-[30%]", tilt: "-rotate-12", size: "h-10 w-10 sm:h-12 sm:w-12", floatDelay: "0.4s", floatDuration: "7.4s" },
  { clubIndex: 12, position: "right-[22%] top-[33%]", tilt: "rotate-12", size: "h-11 w-11 sm:h-14 sm:w-14", floatDelay: "2.2s", floatDuration: "5.7s" },
  { clubIndex: 13, position: "right-[8%] top-[42%]", tilt: "-rotate-6", size: "h-10 w-10 sm:h-12 sm:w-12", floatDelay: "1s", floatDuration: "6.7s" },
  { clubIndex: 14, position: "left-[30%] top-[68%]", tilt: "rotate-6", size: "h-10 w-10 sm:h-12 sm:w-12", floatDelay: "1.5s", floatDuration: "6.1s" },
  { clubIndex: 15, position: "right-[32%] top-[72%]", tilt: "-rotate-3", size: "h-12 w-12 sm:h-14 sm:w-14", floatDelay: "2.5s", floatDuration: "7.1s" },
]

function getShortName(name: string): string {
  // Use username-like abbreviation: take first letters of each word, or first 4 chars
  const words = name.split(/\s+/)
  if (words.length > 1) return words.map(w => w[0]).join("").toUpperCase().slice(0, 4)
  return name.slice(0, 4).toUpperCase()
}

export function ScatteredHeroBackground({ clubs }: { clubs: Club[] }) {
  if (!clubs.length) return null

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      {layout.slice(0, Math.min(layout.length, clubs.length)).map((slot, i) => {
        const club = clubs[slot.clubIndex]
        const shortName = getShortName(club.name)
        return (
          <div
            key={`${club.id}-${i}`}
            className={`group absolute ${slot.position} ${slot.tilt} transition-transform duration-300 ease-out hover:z-30 hover:scale-125 hover:rotate-0 focus-within:z-30 focus-within:scale-125 focus-within:rotate-0`}
          >
            <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border-2 border-slate-900 bg-highlighter px-3 py-0.5 font-marker text-sm font-bold text-slate-900 opacity-0 shadow-[2px_2px_0px_0px_#1e293b] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {shortName} ➔
            </span>

            <div className="float-slow" style={{ animationDelay: slot.floatDelay, animationDuration: slot.floatDuration }}>
              <a
                href={`/clubs/${club.slug}`}
                aria-label={`Visit ${club.name}`}
                className="block rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 outline-none focus-visible:ring-4 focus-visible:ring-marker-blue/50"
              >
                <div className={`${slot.size} flex items-center justify-center rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-slate-300 bg-white/70 p-1 shadow-md backdrop-blur-sm transition-all duration-300 ease-out group-hover:border-marker-blue group-hover:shadow-xl group-focus-within:border-marker-blue group-focus-within:shadow-xl`}>
                  <ClubMark club={club} index={i} size="sm" />
                </div>
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
