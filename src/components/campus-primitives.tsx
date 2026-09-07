"use client"

import { CalendarDays, Users } from "lucide-react"
import { GlassCard } from "@/components/motion-primitives"
import { ClubMark } from "@/components/clubboard/club-identity"

export function EventShowcase({ title, description, date, club, demo = false }: { title: string; description: string; date: string; club: { name: string; category?: string | null; logoUrl: string | null }; demo?: boolean }) {
  return (
    <GlassCard className="group">
      <div className="flex items-start gap-4">
        <ClubMark club={club} size="sm" />
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-marker-blue">{demo ? "Presentation preview" : "Campus event"}</p>
          <h3 className="mt-1 font-display text-2xl leading-none text-slate-900">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
          <p className="mt-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-slate-500"><CalendarDays size={13} /> {date}</p>
        </div>
      </div>
    </GlassCard>
  )
}

export function MemberStack({ members }: { members: { name: string; role?: string }[] }) {
  return (
    <div className="flex items-center gap-3" aria-label={`${members.length} members`}>
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((member) => <span key={member.name} title={member.name} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f6f2e9] bg-marker-blue font-ui text-xs font-bold text-white">{member.name.charAt(0)}</span>)}
      </div>
      <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-slate-500"><Users size={13} /> {members.length} people</span>
    </div>
  )
}
