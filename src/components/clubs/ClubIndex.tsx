"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal, Users } from "lucide-react"
import ClubCard from "@/components/ClubCard"
import ProfessionalBodyGrid from "@/components/ProfessionalBodyGrid"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"

export interface ClubIndexItem {
  id: string
  name: string
  tagline: string | null
  description: string
  logoUrl: string | null
  slug: string | null
  category: string | null
  memberCount: number
  leaderName?: string | null
  recruitmentOpen?: boolean
  requiresApproval?: boolean
}

export default function ClubIndex({ clubs, joinedIds, professionalBodies = [] }: { clubs: ClubIndexItem[]; joinedIds: string[]; professionalBodies?: PresentationProfessionalBody[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"ALL" | "PROFESSIONAL_BODY" | "GENERAL">("ALL")
  const [list, setList] = useState(false)
  const filtered = useMemo(() => clubs.filter((club) => {
    const haystack = `${club.name} ${club.tagline ?? ""} ${club.description}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (category === "ALL" || club.category === category)
  }), [clubs, query, category])
  const professionalCount = professionalBodies.length
  const visibleBodies = professionalBodies.filter((body) => {
    const matchesQuery = `${body.name} ${body.description}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (category === "ALL" || category === "PROFESSIONAL_BODY")
  })

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <header className="mb-14 grid gap-8 border-b-2 border-slate-900 pb-10 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-marker-red">The club index · {clubs.length} communities</p>
          <h1 className="font-display text-6xl leading-[.86] tracking-[-.04em] text-slate-900 sm:text-8xl">FIND YOUR<br /><em className="text-marker-blue">PEOPLE.</em></h1>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-slate-600">Every club is a different way to spend a Tuesday. Browse the campus by energy, interest, or instinct.</p>
      </header>

      <div className="mb-12 flex flex-col gap-4 border-b border-slate-900/20 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the campus..." className="w-full rounded-full border-2 border-slate-900 bg-[#f6f2e9] py-3 pl-11 pr-4 font-ui text-sm outline-none transition-shadow placeholder:text-slate-500 focus:shadow-[3px_3px_0px_0px_#111827]" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {[{ key: "ALL", label: "All clubs" }, { key: "GENERAL", label: "Student clubs" }, { key: "PROFESSIONAL_BODY", label: `Professional bodies · ${professionalCount}` }].map((item) => (
            <button key={item.key} onClick={() => setCategory(item.key as typeof category)} className={`rounded-full border-2 border-slate-900 px-3 py-2 font-ui text-[10px] font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 ${category === item.key ? "bg-slate-900 text-white" : "bg-[#f6f2e9] text-slate-700"}`}>
              {item.label}
            </button>
          ))}
          <button type="button" aria-label="Toggle club list layout" onClick={() => setList((value) => !value)} className="ml-1 rounded-full border-2 border-slate-900 bg-[#f6f2e9] p-2.5 text-slate-700 transition-transform hover:-translate-y-0.5">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-y-2 border-dashed border-slate-900/30 py-24 text-center">
          <Users className="mx-auto mb-4 text-marker-blue" size={34} />
          <h2 className="font-display text-3xl text-slate-900">No matching corner yet.</h2>
          <p className="mt-2 text-sm text-slate-500">Try a different search or browse every club.</p>
        </div>
      ) : (
        <div className={list ? "space-y-5" : "grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"}>
          {filtered.map((club) => <ClubCard key={club.id} club={club} isJoined={joinedIds.includes(club.id)} />)}
        </div>
      )}
      <ProfessionalBodyGrid bodies={visibleBodies} />
    </main>
  )
}
