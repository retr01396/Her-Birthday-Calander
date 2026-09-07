"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import type { AttendanceStatus, EventRegistration, RegistrationType } from "@/lib/types"
import { currentUser } from "@/lib/types"

interface RegistrationsContextValue {
  registrations: EventRegistration[]
  savedEventIds: string[]
  isRegistered: (eventId: string) => boolean
  isSaved: (eventId: string) => boolean
  getRegistration: (eventId: string) => EventRegistration | undefined
  registerInternal: (eventId: string) => void
  registerExternal: (eventId: string, externalPassLink: string) => EventRegistration
  toggleSaved: (eventId: string) => void
  markAttended: (registrationId: string) => void
}

const RegistrationsContext = createContext<RegistrationsContextValue | null>(null)

function generateQrCode(eventId: string, userId: string) {
  return `CB-${eventId.toUpperCase()}-${userId.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function RegistrationsProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([
    {
      id: "r1",
      eventId: "e2",
      userId: currentUser.id,
      registrationType: "INTERNAL",
      qrCode: generateQrCode("e2", currentUser.id),
      status: "registered",
      createdAt: new Date().toISOString(),
    },
  ])
  const [savedEventIds, setSavedEventIds] = useState<string[]>(["e5"])

  const isRegistered = useCallback((eventId: string) => registrations.some((r) => r.eventId === eventId), [registrations])

  const getRegistration = useCallback((eventId: string) => registrations.find((r) => r.eventId === eventId), [registrations])

  const isSaved = useCallback((eventId: string) => savedEventIds.includes(eventId), [savedEventIds])

  const registerInternal = useCallback((eventId: string) => {
    setRegistrations((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        eventId,
        userId: currentUser.id,
        registrationType: "INTERNAL" as RegistrationType,
        qrCode: generateQrCode(eventId, currentUser.id),
        status: "registered" as AttendanceStatus,
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  const registerExternal = useCallback((eventId: string, externalPassLink: string) => {
    const reg: EventRegistration = {
      id: `r${Date.now()}`,
      eventId,
      userId: currentUser.id,
      registrationType: "EXTERNAL",
      externalPassLink,
      qrCode: generateQrCode(eventId, currentUser.id),
      status: "pass_generated",
      createdAt: new Date().toISOString(),
    }
    setRegistrations((prev) => [...prev, reg])
    return reg
  }, [])

  const toggleSaved = useCallback((eventId: string) => {
    setSavedEventIds((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }, [])

  const markAttended = useCallback((registrationId: string) => {
    setRegistrations((prev) => prev.map((r) => (r.id === registrationId ? { ...r, status: "attended" } : r)))
  }, [])

  const value = useMemo(
    () => ({
      registrations,
      savedEventIds,
      isRegistered,
      isSaved,
      getRegistration,
      registerInternal,
      registerExternal,
      toggleSaved,
      markAttended,
    }),
    [registrations, savedEventIds, isRegistered, isSaved, getRegistration, registerInternal, registerExternal, toggleSaved, markAttended],
  )

  return <RegistrationsContext.Provider value={value}>{children}</RegistrationsContext.Provider>
}

export function useRegistrations() {
  const ctx = useContext(RegistrationsContext)
  if (!ctx) throw new Error("useRegistrations must be used within RegistrationsProvider")
  return ctx
}
