"use client"

import { useState } from "react"
import { CalendarDays, Clock, MapPin, ExternalLink, Bookmark, QrCode } from "lucide-react"
import type { Event, Club } from "@/generated/prisma/client"
export type EventWithClub = Event & { club: Club; isDemo?: boolean }
import { markerText } from "@/lib/marker-colors"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const categoryStyle: Record<string, string> = {
  HACKATHON: "text-marker-red",
  WORKSHOP: "text-marker-green",
  CTF: "text-marker-red",
  SEMINAR: "text-marker-blue",
  MEETUP: "text-marker-green",
}

interface EventCardProps {
  event: EventWithClub
  isRegistered?: boolean
  isSaved?: boolean
  onRegister: (event: EventWithClub) => void
  onViewPass: (event: EventWithClub) => void
  rotate?: string
  isDemo?: boolean
}

export function EventCard({ event, onRegister, onViewPass, rotate = "", isRegistered = false, isSaved = false, isDemo = event.isDemo }: EventCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const pctFull = Math.min(100, Math.round((0 / event.capacity) * 100))

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[1.4rem] border border-white/80 bg-white/50 p-5 pt-7 shadow-[0_18px_42px_rgba(17,24,39,.12)] backdrop-blur-xl transition-transform hover:-translate-y-1",
        rotate,
      )}
    >
      <div className="absolute inset-0 -z-10 rounded-[1.4rem] bg-gradient-to-br from-white/70 via-white/20 to-marker-blue/10" aria-hidden="true" />

      <button
        disabled={isDemo}
        onClick={() => setSaved(!saved)}
        aria-label={saved ? "Remove from saved" : "Save event"}
        aria-pressed={saved}
        className="glass-action absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full disabled:cursor-default disabled:opacity-60"
      >
        <Bookmark className={cn("h-4 w-4", saved ? "fill-marker-blue text-marker-blue" : "text-slate-400")} />
      </button>

      <div className="mb-2 flex items-center justify-between gap-2 pr-9">
        <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[.16em]", categoryStyle[("EVENT")])}>
          {isDemo ? "Preview event" : "Campus event"}
        </span>
      </div>

      <span className="mb-2 inline-block w-fit rounded-full border border-white/80 bg-white/45 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md">
        {event.club.name}
      </span>

      <h3 className="mb-1.5 font-display text-3xl leading-tight text-slate-900 text-balance">{event.title}</h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{event.description}</p>

      <div className="mb-4 space-y-1.5 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <span>{new Date(event.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>{new Date(event.startTime).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span>{event.location}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            {0}/{event.capacity} registered
          </span>
          <span className={cn("font-marker font-bold", markerText.green)}>+{event.pointsPerAttender || 10} pts</span>
        </div>
        <Progress value={pctFull} className="h-2 border border-slate-900 bg-slate-100" />
      </div>

      <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {event.regType === "EXTERNAL" ? (
          <>
            <ExternalLink className="h-3.5 w-3.5" />
            <span>External registration</span>
          </>
        ) : (
          <>
            <QrCode className="h-3.5 w-3.5" />
            <span>Native ClubBoard registration</span>
          </>
        )}
      </div>

      <div className="mt-auto">
        {isDemo ? (
          <Button disabled className="w-full rounded-full border border-slate-900/20 bg-slate-900/10 font-ui text-xs font-bold uppercase tracking-wide text-slate-600">
            Presentation preview
          </Button>
        ) : isRegistered ? (
          <Button
            onClick={() => onViewPass(event)}
            className="w-full rounded-full border-2 border-slate-900 bg-marker-green font-marker text-lg font-bold text-white shadow-[2px_2px_0px_0px_#1e293b] hover:bg-emerald-600"
          >
            <QrCode className="mr-2 h-4 w-4" />
            View Pass
          </Button>
        ) : (
          <Button
            onClick={() => onRegister(event)}
            disabled={pctFull >= 100}
            className="w-full rounded-full border-2 border-slate-900 bg-marker-blue font-marker text-lg font-bold text-white shadow-[2px_2px_0px_0px_#1e293b] hover:bg-blue-600 disabled:opacity-50"
          >
            {pctFull >= 100 ? "Full" : "Register Now"}
          </Button>
        )}
      </div>
    </div>
  )
}
