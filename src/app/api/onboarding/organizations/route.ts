import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      where: {
        suspended: false,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        about: true,
        logoUrl: true,
        coverUrl: true,
        category: true,
        tagline: true,
        whatsappGroupUrl: true,
        customFormFields: true,
        _count: {
          select: { members: true },
        },
      },
    });

    const generalClubs = clubs.filter((c) => c.category === "GENERAL");
    const professionalBodies = clubs.filter((c) => c.category === "PROFESSIONAL_BODY");

    return NextResponse.json({
      generalClubs,
      professionalBodies,
    });
  } catch (error) {
    console.error("[onboarding/organizations] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load organizations" },
      { status: 500 }
    );
  }
}
