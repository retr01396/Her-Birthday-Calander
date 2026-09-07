"use client"

import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"
import ProfessionalBodyCard from "@/components/ProfessionalBodyCard"
import { ScrollReveal } from "@/components/motion-primitives"

export default function ProfessionalBodyGrid({ bodies }: { bodies: PresentationProfessionalBody[] }) {
  if (!bodies.length) return null
  return (
    <section className="mt-24 border-t-2 border-slate-900 pt-12" aria-labelledby="professional-bodies-heading">
      <ScrollReveal>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-marker-red">04 · The bridge beyond campus</p>
        <h2 id="professional-bodies-heading" className="mt-3 font-display text-5xl leading-none text-slate-900 sm:text-7xl">PROFESSIONAL<br /><em className="text-marker-blue">BODIES.</em></h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">Connect with communities that bridge campus and the professional world.</p>
      </ScrollReveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {bodies.map((body, index) => <ScrollReveal key={body.id} delay={index * .07}><ProfessionalBodyCard body={body} /></ScrollReveal>)}
      </div>
    </section>
  )
}
