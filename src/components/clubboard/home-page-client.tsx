"use client"

import { useState, useEffect } from "react"
import { Hero } from "@/components/clubboard/hero"
import { EventsFeed } from "@/components/clubboard/events-feed"
import { Navbar } from "@/components/Navbar"
import type { Club, Event } from "@/generated/prisma/client"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"
import CampusIntroSequence from "@/components/CampusIntroSequence"

type EventWithClub = Event & { club: Club }

interface HomePageClientProps {
  clubs: Club[]
  events: EventWithClub[]
  registeredEventIds: string[]
  savedEventIds: string[]
  professionalBodies: PresentationProfessionalBody[]
}

export function HomePageClient({ clubs, events, registeredEventIds, savedEventIds, professionalBodies }: HomePageClientProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "feed">("hero")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen relative">
      <Navbar
        userRole={user?.role ?? null}
        userName={user?.name}
        userEmail={user?.email}
      />
      <CampusIntroSequence clubs={clubs} professionalBodies={professionalBodies} />
      <Hero 
        clubs={clubs}
        professionalBodies={professionalBodies}
        onGetStarted={() => {
          document.getElementById("events-feed")?.scrollIntoView({ behavior: "smooth" })
        }} 
        onViewLeaderboard={() => {
          window.location.href = "/leaderboard"
        }} 
      />
      <EventsFeed 
        events={events} 
        registeredEventIds={registeredEventIds}
        savedEventIds={savedEventIds}
      />
    </div>
  )
}
