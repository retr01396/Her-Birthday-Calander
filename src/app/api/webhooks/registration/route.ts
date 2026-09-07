import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugifyHandle(local: string): string {
  return local.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

async function uniqueHandle(base: string): Promise<string> {
  let handle = base || "student";
  let counter = 1;
  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = `${base}-${counter}`;
    counter++;
  }
  return handle;
}

export async function POST(req: Request) {
  try {
    // 1. Validate x-webhook-secret header
    const secret = req.headers.get("x-webhook-secret");
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret || secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request URL / query parameters and JSON body
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 3. Extract event ID, email, and name from multiple payload patterns (MakeMyPass / RSVP)
    const eventId =
      searchParams.get("eventId") ||
      searchParams.get("event_id") ||
      body.eventId ||
      body.event_id ||
      body.event?.id ||
      body.payload?.eventId ||
      body.payload?.event_id;

    const rawEmail =
      body.email ||
      body.attendee?.email ||
      body.user?.email ||
      body.data?.email ||
      body.payload?.email ||
      body.payload?.attendee?.email;

    const rawName =
      body.name ||
      body.attendee?.name ||
      body.user?.name ||
      body.data?.name ||
      body.payload?.name ||
      body.payload?.attendee?.name;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = rawEmail.toLowerCase().trim();
    const name = typeof rawName === "string" ? rawName.trim() : "";

    // 4. Verify that the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 5. Look up user or create placeholder account
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const handle = await uniqueHandle(slugifyHandle(email.split("@")[0]));
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          handle,
          password: "", // Indicates placeholder
          role: "STUDENT",
          onboardingCompleted: false,
        },
      });
    }

    // 6. Create or match registration
    const registration = await prisma.registration.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
      create: {
        userId: user.id,
        eventId: event.id,
        status: "REGISTERED",
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      userId: user.id,
      eventId: event.id,
    });
  } catch (err: any) {
    console.error("[webhooks/registration] error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
