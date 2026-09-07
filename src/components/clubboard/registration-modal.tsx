"use client"

import { useState } from "react"
import { ExternalLink, Link2, QrCode, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Event, Club } from "@/generated/prisma/client"
export type EventWithClub = Event & { club: Club }
import { currentUser, type EventRegistration } from "@/lib/types"
import { useRegistrations } from "@/lib/registrations-store"
import { QrPassCard } from "@/components/clubboard/qr-pass-card"

interface RegistrationModalProps {
  event: EventWithClub | null
  onClose: () => void
}

export function RegistrationModal({ event, onClose }: RegistrationModalProps) {
  const { registerInternal, registerExternal } = useRegistrations()
  const [link, setLink] = useState("")
  const [generatedReg, setGeneratedReg] = useState<EventRegistration | null>(null)

  if (!event) return null

  const handleClose = () => {
    setLink("")
    setGeneratedReg(null)
    onClose()
  }

  const handleInternalRegister = () => {
    registerInternal(event.id)
    handleClose()
  }

  const handleGeneratePass = () => {
    if (!link.trim()) return
    const reg = registerExternal(event.id, link.trim())
    setGeneratedReg(reg)
  }

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md rounded-lg border-2 border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_#1e293b]">
        {event.regType === "INTERNAL" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-marker text-2xl font-bold text-slate-900">Confirm Registration</DialogTitle>
              <DialogDescription className="text-slate-600">
                You&apos;re registering for <span className="font-semibold text-slate-800">{event.title}</span> hosted by{" "}
                {event.club.name}. This is a native ClubBoard event &mdash; no external link needed.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border-2 border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <QrCode className="h-4 w-4 text-marker-blue" /> A unified ClubBoard Pass with QR code will be generated instantly.
              </p>
              <p className="mt-1">
                You&apos;ll earn <span className="font-marker font-bold text-marker-green">+{event.pointsPerAttender} pts</span> once your
                attendance is scanned at the venue.
              </p>
            </div>
            <Button
              onClick={handleInternalRegister}
              className="w-full rounded-full border-2 border-slate-900 bg-marker-blue font-marker text-lg font-bold text-white shadow-[2px_2px_0px_0px_#1e293b] hover:bg-blue-600"
            >
              Generate ClubBoard Pass
            </Button>
          </>
        ) : !generatedReg ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-marker text-2xl font-bold text-slate-900">External Registration</DialogTitle>
              <DialogDescription className="text-slate-600">
                <span className="font-semibold text-slate-800">{event.title}</span> is hosted externally via{" "}
                <span className="font-semibold">{event.externalProvider}</span>. Register there first, then paste your ticket link below
                to generate your unified ClubBoard Pass.
              </DialogDescription>
            </DialogHeader>

            {event.externalRegUrl && (
              <a
                href={event.externalRegUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border-2 border-slate-900 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-[2px_2px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-marker-blue" />
                  Open {event.externalProvider} registration
                </span>
                <span className="font-marker text-marker-blue">Go &rarr;</span>
              </a>
            )}

            <div className="space-y-2">
              <Label htmlFor="pass-link" className="font-marker text-base font-bold text-slate-800">
                Paste your external ticket/pass link here
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="pass-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://makemypass.com/ticket/..."
                  className="border-2 border-slate-900 pl-9 shadow-[2px_2px_0px_0px_#1e293b] focus-visible:ring-marker-blue"
                />
              </div>
            </div>

            <Button
              onClick={handleGeneratePass}
              disabled={!link.trim()}
              className="w-full rounded-full border-2 border-slate-900 bg-marker-red font-marker text-lg font-bold text-white shadow-[2px_2px_0px_0px_#1e293b] hover:bg-red-600 disabled:opacity-50"
            >
              Generate ClubBoard Pass
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-marker text-2xl font-bold text-slate-900">
                <CheckCircle2 className="h-6 w-6 text-marker-green" />
                Pass Generated
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Show this QR at the venue on event day for scanning and attendance points.
              </DialogDescription>
            </DialogHeader>
            <QrPassCard event={event} user={currentUser} registration={generatedReg} />
            <Button
              onClick={handleClose}
              className="w-full rounded-full border-2 border-slate-900 bg-marker-blue font-marker text-lg font-bold text-white shadow-[2px_2px_0px_0px_#1e293b] hover:bg-blue-600"
            >
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
