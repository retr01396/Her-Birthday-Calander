import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { consumeOtpToken } from "@/lib/otp";

/**
 * Change a club's official email.
 *
 * Security model: both addresses must have been OTP-verified first (purpose
 * EMAIL_VERIFICATION). The old address must match the club's current email and
 * its verification token must be presented too, so a lead can't silently swap
 * the address without access to the old inbox.
 */
export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || sessionUser.role !== "CLUB" || !sessionUser.clubId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const newEmail =
      typeof body?.newEmail === "string"
        ? body.newEmail.trim().toLowerCase()
        : "";
    const newToken = typeof body?.newToken === "string" ? body.newToken : "";
    const oldEmail =
      typeof body?.oldEmail === "string"
        ? body.oldEmail.trim().toLowerCase()
        : "";
    const oldToken = typeof body?.oldToken === "string" ? body.oldToken : "";

    if (!newEmail || !newToken) {
      return NextResponse.json(
        { error: "The new email and its verification are required." },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id: sessionUser.clubId },
      select: { id: true, email: true },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    // If the club already has an email, the OLD address must be verified too.
    if (club.email) {
      if (!oldEmail || !oldToken) {
        return NextResponse.json(
          { error: "The current club email and its verification are required." },
          { status: 400 }
        );
      }
      if (oldEmail !== club.email) {
        return NextResponse.json(
          { error: "The current club email does not match." },
          { status: 400 }
        );
      }
      const oldRecord = await consumeOtpToken(
        oldEmail,
        "EMAIL_VERIFICATION",
        oldToken
      );
      if (!oldRecord) {
        return NextResponse.json(
          {
            error:
              "The verification for the current email is invalid or expired. Please verify it again.",
          },
          { status: 400 }
        );
      }
    }

    // The new address must have been OTP-verified.
    const newRecord = await consumeOtpToken(
      newEmail,
      "EMAIL_VERIFICATION",
      newToken
    );
    if (!newRecord) {
      return NextResponse.json(
        {
          error:
            "The verification for the new email is invalid or expired. Please verify it again.",
        },
        { status: 400 }
      );
    }

    // The address can't already belong to another club or student.
    const otherClub = await prisma.club.findFirst({
      where: { email: newEmail, NOT: { id: club.id } },
    });
    const student = await prisma.user.findUnique({ where: { email: newEmail } });
    if (otherClub || student) {
      return NextResponse.json(
        { error: "This email is already in use by another account." },
        { status: 409 }
      );
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { email: newEmail, emailVerifiedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Club email updated successfully.",
      email: newEmail,
    });
  } catch (err) {
    console.error("[api/club/update-email] error:", err);
    return NextResponse.json(
      { error: "Failed to update club email." },
      { status: 500 }
    );
  }
}
