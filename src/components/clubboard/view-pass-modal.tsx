"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Event, Club } from "@/generated/prisma/client"
export type EventWithClub = Event & { club: Club }
import { currentUser } from "@/lib/types"
import { useRegistrations } from "@/lib/registrations-store"
import { QrPassCard } from "@/components/clubboard/qr-pass-card"

interface ViewPassModalProps {
  event: EventWithClub | null
  onClose: () => void
}

export function ViewPassModal({ event, onClose }: ViewPassModalProps) {
  const { getRegistration } = useRegistrations()
  if (!event) return null
  const registration = getRegistration(event.id)
  if (!registration) return null

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-lg border-2 border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_#1e293b]">
        <DialogHeader>
          <DialogTitle className="font-marker text-2xl font-bold text-slate-900">Your ClubBoard Pass</DialogTitle>
          <DialogDescription className="text-slate-600">Keep this handy &mdash; you&apos;ll need it at check-in.</DialogDescription>
        </DialogHeader>
        <QrPassCard event={event} user={currentUser} registration={registration} />
      </DialogContent>
    </Dialog>
  )
}
