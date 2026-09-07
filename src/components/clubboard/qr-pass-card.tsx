import { CalendarDays, MapPin } from "lucide-react"
import type { Event, Club } from "@/generated/prisma/client"
export type EventWithClub = Event & { club: Club }
import { MockQr } from "@/components/clubboard/mock-qr"
import { SketchyAvatar } from "@/components/clubboard/sketchy-avatar"
import type { EventRegistration, User } from "@/lib/types"

interface QrPassCardProps {
  event: EventWithClub
  user: User
  registration: EventRegistration
}

export function QrPassCard({ event, user, registration }: QrPassCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm rounded-lg border-2 border-slate-900 bg-white p-5 pt-8 shadow-[3px_3px_0px_0px_#1e293b]">
      <div className="tape" aria-hidden="true" />

      <div className="mb-3 flex items-center justify-between">
        <span className="font-marker text-xl font-bold text-marker-blue">ClubBoard Pass</span>
        <span className="rounded-full border border-slate-900 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-marker-green">
          {registration.status === "attended" ? "Attended" : "Valid"}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3 border-b-2 border-dashed border-slate-300 pb-4">
        <SketchyAvatar initials={user.avatarInitials} color={user.avatarColor} size="md" />
        <div className="min-w-0">
          <p className="truncate font-marker text-lg font-bold leading-tight text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-marker text-lg font-bold leading-tight text-slate-900 text-balance">{event.title}</p>
        <div className="mt-1.5 space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {new Date(event.startDate).toLocaleDateString()} &middot; {new Date(event.startTime).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-4">
        <MockQr value={registration.qrCode} size={140} />
        <p className="font-mono text-[11px] tracking-wider text-slate-500">{registration.qrCode}</p>
      </div>

      {registration.externalPassLink && (
        <p className="mt-3 truncate text-center text-[11px] text-slate-400">Linked pass: {registration.externalPassLink}</p>
      )}

      <p className="mt-3 text-center text-[11px] text-slate-400">Present this QR at the venue for scanning on event day.</p>
    </div>
  )
}
