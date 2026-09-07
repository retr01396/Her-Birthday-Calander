"use client"

import Link from "next/link"
import { ExternalLink, Landmark } from "lucide-react"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"
import { GlassCard } from "@/components/motion-primitives"

export default function ProfessionalBodyCard({ body }: { body: PresentationProfessionalBody }) {
  return (
    <GlassCard className="group min-h-[285px] border-slate-900/15 bg-white/35 p-6">
      <div className="flex h-24 items-center justify-between border-b border-slate-900/10 pb-5">
        {body.logoUrl ? (
          // Official asset from the organization's public website.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={body.logoUrl} alt={`${body.name} official logo`} className="max-h-16 max-w-[170px] object-contain" />
        ) : (
          <div className="flex items-center gap-3 text-slate-500">
            <Landmark size={26} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[.14em]">Official asset pending</span>
          </div>
        )}
        <span className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-marker-blue">Professional body</span>
      </div>
      <h3 className="mt-6 font-display text-4xl leading-none text-slate-900">{body.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{body.description}</p>
      <Link href={`/clubs/${body.slug}`} className="mt-5 inline-flex items-center gap-2 font-ui text-[10px] font-bold uppercase tracking-[.14em] text-marker-blue transition-colors hover:text-marker-red">
        View profile <ExternalLink size={13} />
      </Link>
    </GlassCard>
  )
}
