import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { departmentDisplayName, classDisplayName } from "@/lib/departments";

/**
 * Admin Reports — Pending Onboarding Tracker.
 *
 * Lists students who have NOT completed the mandatory onboarding flow
 * (onboardingCompleted = false), grouped class-wise by department + year.
 * `handle` and `email` are the generated credentials the student uses to log in.
 *
 * Query params:
 *   department   — exact department value (case-insensitive); omit for all
 *   division     — exact class division (e.g. CSE-A); omit for all
 *   year         — "1".."4" (maps to "1st Year".."4th Year") or a raw value
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

    const results = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        onboardingCompleted: false,
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
        createdAt: true,
      },
      orderBy: [
        { department: "asc" },
        { division: "asc" },
        { yearOfStudy: "asc" },
        { name: "asc" },
      ],
    });

    const pendingStudents = results.map((student) => ({
      ...student,
      department: departmentDisplayName(student.department),
      classGroup: classDisplayName(student.department, student.division),
    }));

    return NextResponse.json({ success: true, pendingStudents });
  } catch (err) {
    console.error("Pending Onboarding API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch pending onboarding accounts" },
      { status: 500 }
    );
  }
}
