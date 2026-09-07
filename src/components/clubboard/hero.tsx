"use client"

import { ArrowDown, ArrowRight, Compass, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClubLogoMarquee } from "@/components/clubboard/marquees"
import { ScatteredHeroBackground } from "@/components/clubboard/scattered-hero-background"
import type { Club } from "@/generated/prisma/client"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"

interface HeroProps {
  clubs: Club[]
  onGetStarted: () => void
  onViewLeaderboard: () => void
  professionalBodies?: PresentationProfessionalBody[]
}

export function Hero({ clubs, onGetStarted, onViewLeaderboard, professionalBodies = [] }: HeroProps) {
  return (
    <section className="relative campus-paper overflow-hidden border-b-2 border-slate-900">
      <ScatteredHeroBackground clubs={clubs} />

      <div className="relative z-10 mx-auto grid min-h-[670px] max-w-7xl grid-cols-1 items-end gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1fr_380px] lg:pb-28 lg:pt-40">
        <div className="pointer-events-none max-w-4xl">
          <div className="pointer-events-auto mb-8 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-slate-500 reveal-up">
            <span className="h-2 w-2 rounded-full bg-marker-green ring-4 ring-marker-green/20" />
            Live across campus · {clubs.length} communities
          </div>

          <h1 className="font-display text-[clamp(4rem,11vw,9.5rem)] leading-[.82] tracking-[-.055em] text-slate-900 reveal-up">
            THE CAMPUS<br />
            <span className="relative inline-block text-marker-blue">WHITEBOARD<span className="absolute -bottom-3 left-0 h-3 w-3/4 -rotate-2 bg-highlighter/80" /></span>
          </h1>

          <p className="mt-10 max-w-xl text-pretty text-lg leading-relaxed text-slate-700 sm:text-xl reveal-up [animation-delay:120ms]">
            A living space for clubs, people, ideas and events. Find the community that makes campus feel like yours.
          </p>

          <div className="pointer-events-auto relative z-10 mt-10 flex flex-wrap items-center gap-4 reveal-up [animation-delay:220ms]">
          <Button
            onClick={onGetStarted}
            className="group h-auto rounded-full border-2 border-slate-900 bg-marker-blue px-7 py-3 font-ui text-sm font-bold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5 hover:bg-blue-600"
          >
            Explore the campus
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={onViewLeaderboard}
            variant="outline"
            className="h-auto rounded-full border-2 border-slate-900 bg-[#f6f2e9] px-7 py-3 font-ui text-sm font-bold uppercase tracking-wide text-slate-900 shadow-[3px_3px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5 hover:bg-white"
          >
            <Trophy className="mr-2 h-5 w-5 text-marker-green" strokeWidth={2.5} />
            Campus rankings
          </Button>
          </div>
        </div>

        <div className="pointer-events-auto relative mb-2 hidden lg:block">
          <div className="ambient-drift border-l-2 border-slate-900 pl-6">
            <Compass className="mb-5 text-marker-red" size={30} />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">A campus in motion</p>
            <p className="mt-3 font-display text-4xl leading-none text-slate-900">Choose a corner.<br /><em className="text-marker-red">Make it yours.</em></p>
            <div className="mt-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-slate-500"><ArrowDown size={14} /> Scroll to browse communities</div>
          </div>
        </div>
      </div>

      <ClubLogoMarquee clubs={clubs} professionalBodies={professionalBodies} />
    </section>
  )
}
