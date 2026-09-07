import type { Club, Event } from "@/generated/prisma/client"
import type { ClubRank, StudentRank } from "@/lib/leaderboard"

export type PresentationMember = {
  id: string
  userId: string
  roleTitle: string
  clubRole: string
  isExecutive: boolean
  displayName: string
  avatarUrl: string | null
  user: { id: string; name: string; email: string }
}

export type PresentationClub = Club & {
  _count: { members: number; events: number }
  members: PresentationMember[]
  events: PresentationEvent[]
}

export type PresentationEvent = Event & { club: Club; isDemo: true }

const suppliedClubs = [
  ["Music Club", "GENERAL", "A room for rhythm, voice, and the songs that make campus feel close.", "Mr. Nithin V K", ["Ms. Jasmine Jolly", "Ms. Reshma P B", "Ms. Vinitha K V"]],
  ["Comedy Club", "GENERAL", "A playful stage for sharp stories, brave punchlines, and better moods.", "Mr. Prasanth K Baby", ["Ms. Vineetha K V", "Ms. Jincy Denny", "Mr. Febin Raju"]],
  ["Dance Club", "GENERAL", "Movement, music, and the collective energy of making a room move.", "Ms. Akhila K", ["Ms. Vinitha E V", "Ms. Catherine J. Nereveettil", "Mr. Anagh Ramesh"]],
  ["Actor's Club", "GENERAL", "A stage for character, performance, and stories that stay after the curtain.", "Mr. Vishnu K", ["Ms. Aswathy P Sajeev", "Ms. Sabira P S", "Dr. Nitha C Velayudhan"]],
  ["Community Committed Activities Club", "GENERAL", "People-first projects that turn care into visible work across campus.", "Ms. Neelima S", ["Ms. Preethi T I", "Mr. Eldhose P Simon", "Mr. Vipin Padmanabhan"]],
  ["Speech Club", "GENERAL", "Find your voice, make the case, and learn the power of a room listening.", "Ms. Midhu Elizabeth", ["Ms. Anitta Antony", "Ms. Bhagyasree P V", "Ms. Krishnapriya P S"]],
  ["Debate Club", "GENERAL", "Ideas meet in the open: rigorous arguments, generous listening, and spirited exchange.", "Mr. Vivek K Viswanath", ["Ms. Christeena Varghese", "Ms. Neelima S", "Ms. Chaithannia T S", "Ms. Merryl Mary"]],
  ["Quiz Committee", "GENERAL", "Curiosity, quick thinking, and the joy of knowing one more thing.", "Ms. Aiswarya S M", ["Ms. Sreelakshmi K K", "Ms. Bincy T J", "Ms. Bijy Antony"]],
  ["Culinary and Holistic Activities Club", "GENERAL", "Food, wellbeing, and the rituals that help a community slow down together.", "Ms. Iris Jose", ["Ms. Reena C. G", "Ms. Anjana B", "Ms. Melby Joy"]],
  ["Cycle Club", "GENERAL", "Take the long way: wheels, fresh air, and a campus seen at a different speed.", "Fr. Milner Paul V", ["Mr. Vineed S Menon", "Mr. Vaishak C Krishnan"]],
  ["English Club", "GENERAL", "Reading, writing, and the conversations that begin on the page.", "Mr. Watson Thomas", ["Ms. Midhu Elizabeth George", "Mr. John Mathew", "Ms. Rinsu Aravind"]],
  ["Science Club", "GENERAL", "A curious corner for experiments, questions, and the beautiful mess of discovery.", "Ms. Susen Jose", ["Dr. Diana Mathew", "Ms. Petcy Annie M M", "Ms. Keerthana K R"]],
  ["Yuva Club", "GENERAL", "Young energy directed toward connection, service, and making the next thing better.", "Ms. Aswathy P Sajeev", ["Ms. Neenu Johnson", "Ms. Rinsu Aravind", "Mr. Salish P Louis"]],
  ["Robotics Club", "GENERAL", "Human imagination meets mechanical precision in a lab built for prototypes.", "Dr. Vinoj P G", ["Ms. Merryl Mary", "Ms. Sreelekha T.", "Mr. Jinu K T"]],
] as const

export type PresentationProfessionalBody = {
  id: string
  name: "µLearn" | "IEDC" | "IEEE" | "CSI"
  slug: string
  category: "PROFESSIONAL_BODY"
  description: string
  officialSource: string
  logoUrl: string | null
  logoStatus: "official" | "asset-pending"
}

const professionalBodies: PresentationProfessionalBody[] = [
  { id: "presentation-body-mulearn", name: "µLearn", slug: "mulearn", category: "PROFESSIONAL_BODY", description: "An open community for learners, makers, and innovators built around peer-led growth.", officialSource: "https://mulearn.org/", logoUrl: "https://mulearn.org/_next/image?url=%2Fassets%2Flogo.png&w=256&q=75", logoStatus: "official" },
  { id: "presentation-body-iedc", name: "IEDC", slug: "iedc", category: "PROFESSIONAL_BODY", description: "Innovation and Entrepreneurship Development Centres connect students with Kerala's startup ecosystem.", officialSource: "https://startupmission.kerala.gov.in/", logoUrl: null, logoStatus: "asset-pending" },
  { id: "presentation-body-ieee", name: "IEEE", slug: "ieee", category: "PROFESSIONAL_BODY", description: "The IEEE professional community advances technology and supports technical learning worldwide.", officialSource: "https://www.ieee.org/", logoUrl: "https://www.ieee.org/content/dam/ieee-web/org/about/ieee_logo.png", logoStatus: "official" },
  { id: "presentation-body-csi", name: "CSI", slug: "csi", category: "PROFESSIONAL_BODY", description: "The Computer Society of India brings together professionals and students around computing.", officialSource: "https://www.csi-india.org/", logoUrl: null, logoStatus: "asset-pending" },
]

export function getPresentationProfessionalBodies() {
  return professionalBodies
}

export function getPresentationProfessionalBodyBySlug(slug: string) {
  return professionalBodies.find((body) => body.slug === slug) ?? null
}

export function getDemoLeaderboard() {
  const studentNames = ["Ayaan Rahman", "Meera Joseph", "Arjun Nair", "Diya Thomas", "Rohan Menon", "Sarah Mathew", "Adithya Krishnan", "Neha Varghese"]
  const points = [480, 445, 421, 398, 374, 352, 331, 309]
  const students: StudentRank[] = studentNames.map((name, index) => ({ id: `demo-student-${index + 1}`, name, department: ["Computer Science", "Design", "Electronics", "Commerce"][index % 4], yearOfStudy: `${(index % 4) + 1}`, eventsAttended: 8 - Math.floor(index / 2), clubsJoined: 3 - (index > 5 ? 1 : 0), points: points[index], badge: index < 3 ? "CAMPUS LEAD" : "ACTIVE PARTICIPANT" }))
  const names = ["Music Club", "Robotics Club", "Dance Club", "Science Club", "Actor's Club", "Speech Club"]
  const clubs: ClubRank[] = names.map((name, index) => ({ id: `demo-club-${index + 1}`, name, slug: slugify(name), logoUrl: null, category: "GENERAL", eventCount: 8 - index, memberCount: 48 - index * 4, totalRegistrations: 210 - index * 17, score: 960 - index * 74, badge: index < 2 ? "CAMPUS ICON" : "ACTIVE CLUB", latestEvent: "Presentation data" }))
  return { students, clubs }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function baseClub(index: number, row: (typeof suppliedClubs)[number]): Club {
  const [name, category, description] = row
  const id = `presentation-club-${index + 1}`
  return {
    id,
    name,
    slug: slugify(name),
    username: slugify(name).replace(/-/g, ""),
    passwordHash: "",
    email: null,
    emailVerifiedAt: null,
    description,
    createdAt: new Date("2026-01-01"),
    about: description,
    coverUrl: null,
    github: null,
    instagram: null,
    logoUrl: null,
    tagline: description,
    website: null,
    category: category as Club["category"],
    discord: null,
    recruitmentStatus: "OPEN_FOR_MEMBERS",
    suspended: false,
    whatsappGroupUrl: null,
    membershipRequiresApproval: false,
    status: "PUBLISHED",
    updatedAt: new Date("2026-01-01"),
    points: 0,
  } as Club
}

export function getPresentationClubs(): PresentationClub[] {
  const clubs = suppliedClubs.map((row, index) => {
    const club = baseClub(index, row)
    const leader = row[3]
    const names = [leader, ...row[4]]
    const members = names.map((name, memberIndex) => ({
      id: `${club.id}-member-${memberIndex + 1}`,
      userId: `${club.id}-user-${memberIndex + 1}`,
      roleTitle: memberIndex === 0 ? "Chairperson" : "Member",
      clubRole: memberIndex === 0 ? "LEADER" : "MEMBER",
      isExecutive: memberIndex === 0,
      displayName: name,
      avatarUrl: null,
      user: { id: `${club.id}-user-${memberIndex + 1}`, name, email: `${slugify(name)}@campushub.demo` },
    }))
    return {
      ...club,
      _count: { members: names.length, events: 1 },
      members,
      events: [],
    } as PresentationClub
  })
  const events = getPresentationEvents(clubs)
  return clubs.map((club) => ({ ...club, events: events.filter((event) => event.clubId === club.id), _count: { ...club._count, events: events.filter((event) => event.clubId === club.id).length } }))
}

export function getPresentationEvents(clubs = getPresentationClubsWithoutEvents()): PresentationEvent[] {
  const concepts = [
    ["AI NIGHT", "Science Club", "An evening of experiments, questions, and practical demos.", "Science Atrium"],
    ["Campus Hack Sprint", "Robotics Club", "A focused build session for ambitious prototypes and curious teams.", "Innovation Lab"],
    ["Design After Dark", "Actor's Club", "A late studio session where performance and visual storytelling cross paths.", "Black Box Studio"],
    ["Creative Coding Jam", "Music Club", "Sound, motion, and code meet in an open-ended creative workshop.", "Media Room"],
  ] as const
  const now = new Date()
  return concepts.map(([title, clubName, description, location], index) => {
    const club = clubs.find((item) => item.name === clubName) ?? clubs[index % Math.max(clubs.length, 1)]
    const start = new Date(now.getTime() + (index + 2) * 86400000)
    start.setHours(17 + (index % 2), 0, 0, 0)
    return {
      id: `presentation-event-${index + 1}`,
      title,
      description,
      location,
      startDate: start,
      totalSeats: 80,
      createdAt: now,
      clubId: club?.id ?? "presentation-club-1",
      imageUrl: null,
      passType: "PASS",
      startTime: start,
      endTime: new Date(start.getTime() + 2 * 3600000),
      capacity: 80,
      status: "PUBLISHED",
      registrationOpen: true,
      showCapacityLimit: true,
      requiresApproval: false,
      registrationFee: 0,
      pointsPerAttender: 10,
      isClosed: false,
      finalizedAt: null,
      firstPlacePoints: 50,
      secondPlacePoints: 30,
      thirdPlacePoints: 20,
      firstPlaceWinnerId: null,
      secondPlaceWinnerId: null,
      thirdPlaceWinnerId: null,
      isTeamEvent: false,
      minTeamSize: 2,
      maxTeamSize: 4,
      passStrategy: "CAPTAIN_ONLY",
      firstPlaceTeamId: null,
      secondPlaceTeamId: null,
      thirdPlaceTeamId: null,
      verificationStatus: "NOT_REQUIRED",
      regType: "INTERNAL",
      externalProvider: null,
      externalRegUrl: null,
      club: club ?? clubs[0],
      isDemo: true,
    } as unknown as PresentationEvent
  })
}

function getPresentationClubsWithoutEvents() {
  return suppliedClubs.map((row, index) => baseClub(index, row))
}

export function getPresentationClubBySlug(slug: string) {
  return getPresentationClubs().find((club) => club.slug === slug) ?? null
}
