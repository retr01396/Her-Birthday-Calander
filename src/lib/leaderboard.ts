import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudentRank {
  id: string;
  name: string;

  department: string | null;
  yearOfStudy: string | null;
  eventsAttended: number;
  clubsJoined: number;
  points: number;
  badge: string;
}

export interface ClubRank {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  category: string | null;
  eventCount: number;
  memberCount: number;
  totalRegistrations: number;
  score: number;
  badge: string;
  latestEvent: string | null;
}

// ─── Scoring Logic ───────────────────────────────────────────────────────────
// Student points come from the Event Finalization engine (User.totalPoints):
//   +10 attendance, +50/30/20 for 1st/2nd/3rd place (see the points table on
//   the leaderboard page). Clubs keep an activity-derived score.

const CLUB_SCORE_PER_EVENT = 150;
const CLUB_SCORE_PER_REGISTRATION = 20;
const CLUB_SCORE_PER_MEMBER = 10;

// ─── Badges (derived from actual stats, not static) ─────────────────────────

function studentBadge(stats: { eventsAttended: number; clubsJoined: number }): string {
  if (stats.eventsAttended >= 5) return "EVENT CHAMPION";
  if (stats.clubsJoined >= 3) return "COMMUNITY BUILDER";
  if (stats.eventsAttended >= 2) return "ACTIVE PARTICIPANT";
  if (stats.eventsAttended === 1) return "FIRST TIMER";
  return "EXPLORER";
}

function clubBadge(stats: { eventCount: number; totalRegistrations: number }): string {
  if (stats.eventCount >= 5 && stats.totalRegistrations >= 100)
    return "CAMPUS ICON";
  if (stats.eventCount >= 3) return "PROJECT MASTERS";
  if (stats.eventCount >= 1) return "ACTIVE CLUB";
  return "NEWCOMER";
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Rank all students by points earned through the Event Finalization engine:
 *   eventsAttended  = number of attended Registration rows
 *   clubsJoined     = number of ClubMember rows
 *   points          = User.totalPoints (credited atomically at event
 *                     finalization: +10 attendance, +50/30/20 winner bonuses)
 */
export async function getStudentLeaderboard(): Promise<StudentRank[]> {
  const users = await prisma.user.findMany({
    // Only enrolled students compete on the student leaderboard
    where: { role: { not: "SUPER_ADMIN" } },
    select: {
      id: true,
      name: true,

      department: true,
      yearOfStudy: true,
      totalPoints: true,
      _count: {
        select: {
          registrations: { where: { status: "ATTENDED" } },
          memberships: true,
        },
      },
    },
  });

  return users
    .map((user) => {
      const eventsAttended = user._count.registrations;
      const clubsJoined = user._count.memberships;
      const points = user.totalPoints;
      return {
        id: user.id,
        name: user.name,

        department: user.department,
        yearOfStudy: user.yearOfStudy,
        eventsAttended,
        clubsJoined,
        points,
        badge: studentBadge({ eventsAttended, clubsJoined }),
      };
    })
    .sort((a, b) => b.points - a.points);
}

/**
 * Rank all clubs by performance:
 *   eventCount          = number of events hosted (live Event table)
 *   totalRegistrations  = sum of attended Registration rows across all the club's events
 *   memberCount         = number of ClubMember rows
 *   score               = events*150 + attendedRegistrations*20 + members*10
 */
export async function getClubLeaderboard(): Promise<ClubRank[]> {
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      category: true,
      _count: {
        select: { events: true, members: true },
      },
      events: {
        select: { _count: { select: { registrations: { where: { status: "ATTENDED" } } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch the latest event per club in a single query (avoids N+1)
  const latestEvents = await prisma.event.findMany({
    where: { clubId: { in: clubs.map((c) => c.id) } },
    orderBy: [{ clubId: "asc" }, { startDate: "desc" }],
    select: { clubId: true, title: true },
  });
  const latestByClub = new Map<string, string>();
  for (const event of latestEvents) {
    if (!latestByClub.has(event.clubId)) {
      latestByClub.set(event.clubId, event.title);
    }
  }

  return clubs
    .map((club) => {
      const eventCount = club._count.events;
      const memberCount = club._count.members;
      const totalRegistrations = club.events.reduce(
        (sum, event) => sum + event._count.registrations,
        0
      );
      const score =
        eventCount * CLUB_SCORE_PER_EVENT +
        totalRegistrations * CLUB_SCORE_PER_REGISTRATION +
        memberCount * CLUB_SCORE_PER_MEMBER;

      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        category: club.category,
        eventCount,
        memberCount,
        totalRegistrations,
        score,
        badge: clubBadge({ eventCount, totalRegistrations }),
        latestEvent: latestByClub.get(club.id) ?? null,
      };
    })
    .sort((a, b) => b.score - a.score);
}
