import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { consumeOtpToken, OTP_PURPOSES, type OtpPurpose } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const purpose = body?.purpose as OtpPurpose | undefined;
    const actionToken = typeof body?.actionToken === "string" ? body.actionToken : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!identifier || !purpose || !OTP_PURPOSES.includes(purpose) || !actionToken) {
      return NextResponse.json(
        { error: "Email, purpose, and verification token are required." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Validate + consume the single-use token in one step.
    const record = await consumeOtpToken(identifier, purpose, actionToken);
    if (!record) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired verification. Please request a new OTP and try again.",
        },
        { status: 400 }
      );
    }

    // Students identify by email; clubs by username or their verified email.
    const user = await prisma.user.findUnique({ where: { email: identifier } });
    const club = user
      ? null
      : await prisma.club.findUnique({ where: { username: identifier } });
    const clubByEmail = !user && !club
      ? await prisma.club.findUnique({ where: { email: identifier } })
      : null;
    const resolvedClub = club ?? clubByEmail;

    if (!user && !resolvedClub) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 400 }
      );
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(newPassword) },
      });
    } else {
      await prisma.club.update({
        where: { id: (resolvedClub as { id: string }).id },
        data: { passwordHash: hashPassword(newPassword) },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
