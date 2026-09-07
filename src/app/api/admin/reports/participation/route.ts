import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { departmentDisplayName, classDisplayName } from "@/lib/departments";

/**
 * Admin Reports — Student Event Participation Analytics.
 *
 * Query params:
 *   department   — exact department value (case-insensitive); omit for all
 *   division     — exact class division (e.g. CSE-A); omit for all
 *   year         — "1".."4" (maps to "1st Year".."4th Year") or a raw value
 *   timeline     — "1m" | "3m" | "6m" | "all" (default "all")
 *   sortBy       — "eventsCount" | "name" | "handle" (default "eventsCount")
 *   sortOrder    — "asc" | "desc" (default "desc")
 *
 * Only counts verified attendance (status = ATTENDED) within the timeframe,
 * using the `attendedAt` timestamp set by the QR check-in flow.
 */

const YEAR_MAP: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
};

function normalizeYear(raw: string | null): string | undefined {
  if (!raw || raw === "ALL" || raw === "all") return undefined;
  return YEAR_MAP[raw] ?? raw;
}

function timelineStart(timeline: string | null): Date | undefined {
  if (!timeline || timeline === "all" || timeline === "ALL") return undefined;
  const months: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6 };
  const amount = months[timeline];
  if (!amount) return undefined;
  const now = new Date();
  now.setMonth(now.getMonth() - amount);
  return now;
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const division = searchParams.get("division");
    const year = normalizeYear(searchParams.get("year"));
    const timeline = searchParams.get("timeline") || "all";
    const sortBy = searchParams.get("sortBy") || "eventsCount";
    const sortOrder: "asc" | "desc" =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const startDate = timelineStart(timeline);

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        onboardingCompleted: true,
        ...(department && {
          department: { equals: department, mode: "insensitive" },
        }),
        ...(division && {
          division: { equals: division, mode: "insensitive" },
        }),
        ...(year && { yearOfStudy: year }),
      },
      select: {
        id: true,
        handle: true,
        name: true,
        email: true,
        department: true,
        division: true,
        yearOfStudy: true,
        registrations: {
          where: {
            status: "ATTENDED",
            ...(startDate && { attendedAt: { gte: startDate } }),
          },
          select: {
            id: true,
            pointsEarned: true,
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                firstPlaceWinnerId: true,
                secondPlaceWinnerId: true,
                thirdPlaceWinnerId: true,
                club: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedData = students.map((student) => ({
      id: student.id,
      handle: student.handle,
      name: student.name,
      email: student.email,
      department: departmentDisplayName(student.department),
      division: student.division,
      yearOfStudy: student.yearOfStudy,
      classGroup: [
        classDisplayName(student.department, student.division),
        student.yearOfStudy,
      ]
        .filter(Boolean)
        .join(" • "),
      attendedEventsCount: student.registrations.length,
      pointsEarned: student.registrations.reduce(
        (sum, r) => sum + (r.pointsEarned || 0),
        0
      ),
      bestPlace: (() => {
        const ids = student.registrations.map((r) => r.event);
        if (ids.some((e) => e.firstPlaceWinnerId === student.id)) return "1ST";
        if (ids.some((e) => e.secondPlaceWinnerId === student.id)) return "2ND";
        if (ids.some((e) => e.thirdPlaceWinnerId === student.id)) return "3RD";
        return null;
      })(),
      attendedEvents: student.registrations.map((r) => {
        const event = r.event;
        const place =
          event.firstPlaceWinnerId === student.id
            ? "1st"
            : event.secondPlaceWinnerId === student.id
            ? "2nd"
            : event.thirdPlaceWinnerId === student.id
            ? "3rd"
            : null;
        return {
          eventTitle: event.title,
          clubName: event.club.name,
          date: event.startDate,
          place,
          pointsEarned: r.pointsEarned || 0,
        };
      }),
    }));

    formattedData.sort((a, b) => {
      if (sortBy === "eventsCount") {
        return sortOrder === "desc"
          ? b.attendedEventsCount - a.attendedEventsCount
          : a.attendedEventsCount - b.attendedEventsCount;
      }
      if (sortBy === "name") {
        return sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      if (sortBy === "handle") {
        return sortOrder === "desc"
          ? b.handle.localeCompare(a.handle)
          : a.handle.localeCompare(b.handle);
      }
      return 0;
    });

    return NextResponse.json({ success: true, students: formattedData });
  } catch (err) {
    console.error("Participation API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch participation data" },
      { status: 500 }
    );
  }
}
