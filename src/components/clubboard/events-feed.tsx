"use client"

import { useMemo, useState } from "react"
import { CalendarClock } from "lucide-react"
import type { Event, Club } from "@/generated/prisma/client"
export type EventWithClub = Event & { club: Club }
import { EventCard } from "@/components/clubboard/event-card"
import { RegistrationModal } from "@/components/clubboard/registration-modal"
import { ViewPassModal } from "@/components/clubboard/view-pass-modal"
import { useRegistrations } from "@/lib/registrations-store"
import { cn } from "@/lib/utils"

type FilterTab = "upcoming" | "mine" | "saved"

const tabs: { key: FilterTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming Events" },
  { key: "mine", label: "My Passes" },
  { key: "saved", label: "Saved" },
]

const rotations = ["rotate-[-0.6deg]", "rotate-[0.5deg]", "rotate-[-0.3deg]", "rotate-[0.7deg]"]

export function EventsFeed({ 
  events, 
  registeredEventIds, 
  savedEventIds 
}: { 
  events: EventWithClub[],
  registeredEventIds: string[],
  savedEventIds: string[] 
}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming")
  const [registerTarget, setRegisterTarget] = useState<EventWithClub | null>(null)
  const [passTarget, setPassTarget] = useState<EventWithClub | null>(null)

  const isRegistered = (id: string) => registeredEventIds.includes(id)
  const isSaved = (id: string) => savedEventIds.includes(id)

  const filteredEvents = useMemo(() => {
    if (activeTab === "mine") return events.filter((e) => isRegistered(e.id))
    if (activeTab === "saved") return events.filter((e) => isSaved(e.id))
    return events
  }, [events, activeTab, registeredEventIds, savedEventIds])

  return (
    <section id="events-feed" className="campus-paper min-h-screen border-t-2 border-slate-900 px-4 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-marker-red">What happens here</p>
            <h2 className="font-display text-5xl leading-none text-slate-900 sm:text-7xl">Make something<br /><em className="text-marker-blue">happen.</em></h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-slate-600">Events are the sparks inside the communities. Show up, take part, and leave with a story.</p>
        </div>

        <div className="mb-10 flex flex-wrap gap-2 border-y border-slate-900/20 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-full border-2 border-slate-900 px-4 py-2 font-ui text-xs font-bold uppercase tracking-wide transition-transform",
                activeTab === tab.key
                  ? "-translate-y-0.5 bg-marker-blue text-white shadow-[2px_2px_0px_0px_#1e293b]"
                  : "bg-[#f6f2e9] text-slate-700 hover:-translate-y-0.5",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white/60 py-20 text-center">
            <CalendarClock className="h-10 w-10 text-slate-400" />
            <p className="font-marker text-xl font-bold text-slate-600">Nothing here yet</p>
            <p className="max-w-xs text-sm text-slate-500">
              {activeTab === "mine"
                ? "Register for an event to see your passes here."
                : "Save events you're interested in and they'll show up here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                rotate={rotations[i % rotations.length]}
                isRegistered={isRegistered(event.id)}
                onRegister={() => window.location.href = `/events/${event.id}`}
                onViewPass={() => window.location.href = `/events/${event.id}`}
              />
            ))}
          </div>
        )}
      </div>

      <RegistrationModal event={registerTarget} onClose={() => setRegisterTarget(null)} />
      <ViewPassModal event={passTarget} onClose={() => setPassTarget(null)} />
    </section>
  )
}
