"use client"

import Link from "next/link"
import {
  Bike,
  BookOpen,
  Bot,
  ChefHat,
  Drama,
  FlaskConical,
  Mic2,
  Music2,
  MessageSquareQuote,
  Puzzle,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Accent = "blue" | "red" | "green" | "yellow"

const accents: Accent[] = ["blue", "green", "red", "yellow"]

function hashName(name: string) {
  return name.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)
}

function clubAccent(name: string): Accent {
  return accents[hashName(name) % accents.length]
}

function clubIcon(name: string, category: string | null | undefined): LucideIcon {
  const value = `${name} ${category ?? ""}`.toLowerCase()
  if (value.includes("music")) return Music2
  if (value.includes("dance") || value.includes("actor") || value.includes("theatre")) return Drama
  if (value.includes("comedy") || value.includes("speech") || value.includes("debate")) return MessageSquareQuote
  if (value.includes("culinary") || value.includes("food")) return ChefHat
  if (value.includes("cycle")) return Bike
  if (value.includes("english")) return BookOpen
  if (value.includes("science")) return FlaskConical
  if (value.includes("robot")) return Bot
  if (value.includes("community") || value.includes("yuva")) return Users
  if (value.includes("quiz")) return Puzzle
  return Puzzle
}

export function getClubInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words.map((word) => word[0]).join("") : words[0] ?? "C")
    .toUpperCase()
    .slice(0, 3)
}

export function ClubMark({
  club,
  index = 0,
  size = "md",
}: {
  club: { name: string; category?: string | null; logoUrl: string | null }
  index?: number
  size?: "sm" | "md" | "lg"
}) {
  const accent = accents[(hashName(club.name) + index) % accents.length]
  const Icon = clubIcon(club.name, club.category)
  const sizeClass = size === "lg" ? "h-28 w-28" : size === "sm" ? "h-10 w-10" : "h-16 w-16"
  const iconSize = size === "lg" ? 38 : size === "sm" ? 16 : 24

  return (
    <span className={cn("club-mark", `club-mark-${accent}`, sizeClass)} aria-hidden="true">
      {club.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={club.logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <span className="club-mark-scribble">{getClubInitials(club.name)}</span>
          <Icon size={iconSize} strokeWidth={1.8} className="club-mark-icon" />
        </>
      )}
    </span>
  )
}

export function ClubIdentity({
  club,
  index = 0,
  href,
  compact = false,
}: {
  club: { id: string; name: string; category?: string | null; logoUrl: string | null; slug: string | null }
  index?: number
  href?: string
  compact?: boolean
}) {
  const content = (
    <span className={cn("club-identity", compact && "club-identity-compact")}>
      <ClubMark club={club} index={index} size={compact ? "sm" : "md"} />
      <span className="min-w-0">
        <strong className="club-identity-name">{club.name}</strong>
        <small>{club.category === "PROFESSIONAL_BODY" ? "Professional body" : club.category ?? "Campus community"}</small>
      </span>
    </span>
  )

  return href ? <Link href={href} className="club-identity-link">{content}</Link> : content
}
