"use client"

import { ClubMark } from "@/components/clubboard/club-identity"
import type { Club } from "@/generated/prisma/client"
import ClubOpeningTransition from "@/components/ClubOpeningTransition"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"









function MarqueeItem({ club, index }: { club: Club; index: number }) {
  return (
    <ClubOpeningTransition club={club} href={club.slug ? `/clubs/${club.slug}` : `/clubs/${club.id}`}>
      <span className="campus-marquee-item group">
      <ClubMark club={club} index={index} size="sm" />
      <span className="min-w-0 max-w-[12rem]">
        <strong className="block truncate font-ui text-sm font-bold text-slate-900 group-hover:text-marker-blue">{club.name}</strong>
        <small className="block truncate font-mono text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
          {club.category === "PROFESSIONAL_BODY" ? "Professional body" : club.category ?? "Campus community"}
        </small>
      </span>
      <span aria-hidden="true" className="text-xs text-marker-red">↗</span>
      </span>
    </ClubOpeningTransition>
  )
}

function MarqueeRow({ clubs, reverse = false, className = "" }: { clubs: Club[]; reverse?: boolean; className?: string }) {
  const items = [...clubs, ...clubs]
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [8, -8])
  return (
    <motion.div ref={ref} style={{ y }} className="w-max min-w-full">
      <div className={`campus-marquee-row ${reverse ? "reverse" : ""} ${className}`}>
        {items.map((club, index) => <MarqueeItem key={`${club.id}-${index}`} club={club} index={index % clubs.length} />)}
      </div>
    </motion.div>
  )
}

export function ClubLogoMarquee({ clubs, professionalBodies = [] }: { clubs: Club[]; professionalBodies?: PresentationProfessionalBody[] }) {
  if (!clubs.length) return null
  const rows = [
    clubs,
    clubs.slice().reverse(),
    clubs.slice(2).concat(clubs.slice(0, 2)),
    clubs.slice().reverse(),
  ]

  return (
    <section className="campus-marquee campus-paper" aria-label="Campus clubs">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">The club index</span>
        <span className="font-display text-lg italic text-marker-blue">Find your people.</span>
      </div>
      {rows.map((row, index) => <MarqueeRow key={index} clubs={row} reverse={index % 2 === 1} className={index === 1 ? "slow" : index === 2 ? "fast" : ""} />)}
      {!!professionalBodies.length && <div className="campus-marquee-row reverse slow">
        {[...professionalBodies, ...professionalBodies].map((body, index) => <a key={`${body.id}-${index}`} href={`/clubs/${body.slug}`} className="campus-marquee-item group"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-900/20 bg-white/70 p-1">{body.logoUrl ? <img src={body.logoUrl} alt={`${body.name} official logo`} className="max-h-full max-w-full object-contain" /> : <span className="font-ui text-[9px] font-bold">{body.name}</span>}</span><span><strong className="block font-ui text-sm text-slate-900">{body.name}</strong><small className="font-mono text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">Professional body</small></span></a>)}
      </div>}
    </section>
  )
}

export function ClubNameMarquee({ clubs }: { clubs: Club[] }) {
  return <ClubLogoMarquee clubs={clubs} />
}
