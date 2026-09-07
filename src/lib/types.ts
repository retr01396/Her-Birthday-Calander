// Domain models aligned with a standard Next.js App Router + DB schema shape.

export type UserRole = "student" | "club_rep" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  clubId?: string
  points: number
  avatarColor: "blue" | "red" | "green" | "black"
  avatarInitials: string
}

export interface Club {
  id: string
  name: string
  shortName: string
  slug: string
  category: string
  points: number
  memberCount: number
  color: "blue" | "red" | "green"
  repEmail: string
  description: string
  logoUrl: string
}

export type RegistrationType = "INTERNAL" | "EXTERNAL"
export type ExternalProvider = "MAKEMYPASS" | "RSVP" | "OTHERS"
export type EventCategory = "HACKATHON" | "WORKSHOP" | "CTF" | "SEMINAR" | "MEETUP"

export interface EventModel {
  id: string
  title: string
  description: string
  category: EventCategory
  clubId: string
  clubName: string
  date: string
  time: string
  venue: string
  capacity: number
  registered: number
  points: number
  registrationType: RegistrationType
  provider?: ExternalProvider
  externalUrl?: string
  markerColor: "blue" | "red" | "green"
}

export type AttendanceStatus = "registered" | "pass_generated" | "attended"

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  registrationType: RegistrationType
  externalPassLink?: string
  qrCode: string
  status: AttendanceStatus
  createdAt: string
}

// ---------------- MOCK DATA ----------------

export const currentUser: User = {
  id: "u1",
  name: "Riya Sharma",
  email: "riya.sharma@college.edu",
  role: "student",
  points: 1240,
  avatarColor: "blue",
  avatarInitials: "RS",
}

export const clubRepUser: User = {
  id: "u_rep1",
  name: "GDSC Officer",
  email: "gdsc@college.edu",
  role: "club_rep",
  clubId: "c1",
  points: 0,
  avatarColor: "green",
  avatarInitials: "GD",
}

export const clubs: Club[] = [
  {
    id: "c1",
    name: "Google Developer Student Club",
    shortName: "GDSC",
    slug: "gdsc",
    category: "Technology",
    points: 8420,
    memberCount: 214,
    color: "blue",
    repEmail: "gdsc@college.edu",
    description: "Building with Google technologies, one workshop at a time.",
    logoUrl: "/logos/gdsc.png",
  },
  {
    id: "c2",
    name: "IEEE Student Branch",
    shortName: "IEEE",
    slug: "ieee",
    category: "Engineering",
    points: 7910,
    memberCount: 189,
    color: "red",
    repEmail: "ieee@college.edu",
    description: "Advancing technology for the benefit of humanity.",
    logoUrl: "/logos/ieee.png",
  },
  {
    id: "c3",
    name: "Data Science Society",
    shortName: "DSS",
    slug: "data-science-society",
    category: "Technology",
    points: 6890,
    memberCount: 156,
    color: "green",
    repEmail: "dss@college.edu",
    description: "Turning data into decisions.",
    logoUrl: "/logos/dss.png",
  },
  {
    id: "c4",
    name: "Tech Innovators Society",
    shortName: "TIS",
    slug: "tech-innovators",
    category: "Innovation",
    points: 6210,
    memberCount: 142,
    color: "blue",
    repEmail: "tis@college.edu",
    description: "A playground for campus builders and hackers.",
    logoUrl: "/logos/tis.png",
  },
  {
    id: "c5",
    name: "Cyber Security Guild",
    shortName: "CSG",
    slug: "cyber-security-guild",
    category: "Security",
    points: 5430,
    memberCount: 98,
    color: "red",
    repEmail: "csg@college.edu",
    description: "Capture flags, break locks, secure systems.",
    logoUrl: "/logos/csg.png",
  },
  {
    id: "c6",
    name: "Robotics & AI Club",
    shortName: "RAI",
    slug: "robotics-ai",
    category: "Robotics",
    points: 4980,
    memberCount: 87,
    color: "green",
    repEmail: "rai@college.edu",
    description: "Where circuits meet cognition.",
    logoUrl: "/logos/rai.png",
  },
  {
    id: "c7",
    name: "Creative Media Collective",
    shortName: "CMC",
    slug: "creative-media",
    category: "Design",
    points: 3720,
    memberCount: 121,
    color: "blue",
    repEmail: "cmc@college.edu",
    description: "Storytelling through pixels and film.",
    logoUrl: "/logos/cmc.png",
  },
]

export const events: EventModel[] = [
  {
    id: "e1",
    title: "HackTheCampus 2025",
    description: "24-hour build sprint across AI, web, and hardware tracks. Grab a team, ship something wild.",
    category: "HACKATHON",
    clubId: "c4",
    clubName: "Tech Innovators Society",
    date: "Sep 12, 2026",
    time: "9:00 AM",
    venue: "Innovation Hall, Block C",
    capacity: 200,
    registered: 168,
    points: 150,
    registrationType: "EXTERNAL",
    provider: "MAKEMYPASS",
    externalUrl: "https://makemypass.com/event/hackthecampus-2025",
    markerColor: "red",
  },
  {
    id: "e2",
    title: "Intro to Cloud with Firebase",
    description: "Hands-on workshop covering Firebase Auth, Firestore, and hosting for your next side project.",
    category: "WORKSHOP",
    clubId: "c1",
    clubName: "Google Developer Student Club",
    date: "Sep 15, 2026",
    time: "4:00 PM",
    venue: "Seminar Room 2, Block A",
    capacity: 80,
    registered: 52,
    points: 40,
    registrationType: "INTERNAL",
    markerColor: "green",
  },
  {
    id: "e3",
    title: "CampusCTF: Binary Breach",
    description: "Jeopardy-style capture-the-flag with crypto, pwn, and web exploitation challenges.",
    category: "CTF",
    clubId: "c5",
    clubName: "Cyber Security Guild",
    date: "Sep 18, 2026",
    time: "6:00 PM",
    venue: "Lab 4, Block D",
    capacity: 60,
    registered: 60,
    points: 100,
    registrationType: "EXTERNAL",
    provider: "RSVP",
    externalUrl: "https://rsvp.com/e/binary-breach",
    markerColor: "red",
  },
  {
    id: "e4",
    title: "Data Viz Sprint",
    description: "Turn messy datasets into compelling stories using Python and D3 in this fast-paced sprint.",
    category: "WORKSHOP",
    clubId: "c3",
    clubName: "Data Science Society",
    date: "Sep 20, 2026",
    time: "2:00 PM",
    venue: "Computer Lab 1",
    capacity: 50,
    registered: 34,
    points: 40,
    registrationType: "INTERNAL",
    markerColor: "blue",
  },
  {
    id: "e5",
    title: "RoboRumble: Bot Arena",
    description: "Build and battle autonomous bots in a head-to-head arena tournament.",
    category: "MEETUP",
    clubId: "c6",
    clubName: "Robotics & AI Club",
    date: "Sep 22, 2026",
    time: "11:00 AM",
    venue: "Open Ground, Block B",
    capacity: 120,
    registered: 76,
    points: 60,
    registrationType: "EXTERNAL",
    provider: "OTHERS",
    externalUrl: "https://forms.gle/robo-rumble",
    markerColor: "green",
  },
  {
    id: "e6",
    title: "IEEE Tech Talk: Future of 6G",
    description: "Panel discussion with industry researchers on next-gen wireless networks.",
    category: "SEMINAR",
    clubId: "c2",
    clubName: "IEEE Student Branch",
    date: "Sep 25, 2026",
    time: "5:00 PM",
    venue: "Auditorium",
    capacity: 300,
    registered: 211,
    points: 20,
    registrationType: "INTERNAL",
    markerColor: "red",
  },
]

export interface LeaderboardEntry {
  rank: number
  name: string
  email: string
  points: number
  avatarColor: "blue" | "red" | "green" | "black"
  avatarInitials: string
  club: string
}

export interface ScanQueueEntry {
  id: string
  studentName: string
  studentEmail: string
  eventId: string
  qrCode: string
  passLink?: string
  registrationType: RegistrationType
  avatarColor: "blue" | "red" | "green" | "black"
  avatarInitials: string
  checkedIn: boolean
}

export const mockScanQueue: ScanQueueEntry[] = [
  {
    id: "sq1",
    studentName: "Arjun Mehta",
    studentEmail: "arjun.mehta@college.edu",
    eventId: "e1",
    qrCode: "CB-E1-U9921-7F3K2A",
    passLink: "https://makemypass.com/ticket/8823-arjun",
    registrationType: "EXTERNAL",
    avatarColor: "blue",
    avatarInitials: "AM",
    checkedIn: false,
  },
  {
    id: "sq2",
    studentName: "Sneha Kapoor",
    studentEmail: "sneha.kapoor@college.edu",
    eventId: "e2",
    qrCode: "CB-E2-U4410-2M9XZ1",
    registrationType: "INTERNAL",
    avatarColor: "red",
    avatarInitials: "SK",
    checkedIn: false,
  },
  {
    id: "sq3",
    studentName: "Dev Patel",
    studentEmail: "dev.patel@college.edu",
    eventId: "e3",
    qrCode: "CB-E3-U7765-1QW8ER",
    passLink: "https://rsvp.com/pass/dev-patel-3391",
    registrationType: "EXTERNAL",
    avatarColor: "green",
    avatarInitials: "DP",
    checkedIn: true,
  },
  {
    id: "sq4",
    studentName: "Kabir Singh",
    studentEmail: "kabir.singh@college.edu",
    eventId: "e1",
    qrCode: "CB-E1-U3382-9ZXP4T",
    passLink: "https://makemypass.com/ticket/8823-kabir",
    registrationType: "EXTERNAL",
    avatarColor: "black",
    avatarInitials: "KS",
    checkedIn: false,
  },
]

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun Mehta", email: "arjun.mehta@college.edu", points: 2840, avatarColor: "blue", avatarInitials: "AM", club: "GDSC" },
  { rank: 2, name: "Sneha Kapoor", email: "sneha.kapoor@college.edu", points: 2615, avatarColor: "red", avatarInitials: "SK", club: "Cyber Security Guild" },
  { rank: 3, name: "Dev Patel", email: "dev.patel@college.edu", points: 2390, avatarColor: "green", avatarInitials: "DP", club: "Data Science Society" },
  { rank: 4, name: "Riya Sharma", email: "riya.sharma@college.edu", points: 1240, avatarColor: "blue", avatarInitials: "RS", club: "Tech Innovators" },
  { rank: 5, name: "Kabir Singh", email: "kabir.singh@college.edu", points: 1190, avatarColor: "black", avatarInitials: "KS", club: "Robotics & AI" },
  { rank: 6, name: "Meera Iyer", email: "meera.iyer@college.edu", points: 1085, avatarColor: "red", avatarInitials: "MI", club: "IEEE" },
  { rank: 7, name: "Aditya Rao", email: "aditya.rao@college.edu", points: 980, avatarColor: "green", avatarInitials: "AR", club: "Creative Media" },
  { rank: 8, name: "Priya Nair", email: "priya.nair@college.edu", points: 875, avatarColor: "blue", avatarInitials: "PN", club: "GDSC" },
  { rank: 9, name: "Vikram Joshi", email: "vikram.joshi@college.edu", points: 790, avatarColor: "black", avatarInitials: "VJ", club: "Data Science Society" },
  { rank: 10, name: "Ananya Das", email: "ananya.das@college.edu", points: 705, avatarColor: "red", avatarInitials: "AD", club: "Cyber Security Guild" },
]
