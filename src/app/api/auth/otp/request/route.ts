import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueOtp, OTP_PURPOSES, type OtpPurpose } from "@/lib/otp";
import { getCurrentUser } from "@/lib/session";
import {
  clientIp,
  rateLimit,
  OTP_REQUEST_COOLDOWN_SEC,
  OTP_REQUEST_EMAIL_LIMIT,
  OTP_REQUEST_IP_LIMIT,
  OTP_WINDOW_SEC,
} from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const purpose = body?.purpose as OtpPurpose | undefined;

    if (!identifier || !purpose || !OTP_PURPOSES.includes(purpose)) {
      return NextResponse.json(
        { error: "Email and a valid purpose are required." },
        { status: 400 }
      );
    }

    // CHANGE_PASSWORD is only for the signed-in club lead changing their own
    // club's password — the identifier must match the logged-in account.
    if (purpose === "CHANGE_PASSWORD") {
      const user = await getCurrentUser();
      if (!user || user.role !== "CLUB") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (identifier !== user.email) {
        return NextResponse.json(
          { error: "You can only change your own club's password." },
          { status: 403 }
        );
      }
    }

    // EMAIL_VERIFICATION proves ownership of an email the club is claiming
    // (onboarding email, or the new address when changing email). Only the
    // signed-in club account can initiate it.
    if (purpose === "EMAIL_VERIFICATION") {
      const user = await getCurrentUser();
      if (!user || user.role !== "CLUB") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // ── Rate limiting (stops OTP spam) ──
    const ip = clientIp(req);

    // 60s resend cooldown per identifier — also stops double-clicks.
    const cooldown = await rateLimit(
      `otp:req:cooldown:${identifier}`,
      1,
      OTP_REQUEST_COOLDOWN_SEC
    );
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error:
            "Please wait a moment before requesting another code.",
          retryAfter: cooldown.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // 5 codes per email per 15 min — prevents flooding one inbox.
    const emailWindow = await rateLimit(
      `otp:req:email:${identifier}`,
      OTP_REQUEST_EMAIL_LIMIT,
      OTP_WINDOW_SEC
    );
    if (!emailWindow.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many codes requested for this address. Please try again later.",
          retryAfter: emailWindow.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // 10 codes per IP per 15 min.
    const ipWindow = await rateLimit(
      `otp:req:ip:${ip}`,
      OTP_REQUEST_IP_LIMIT,
      OTP_WINDOW_SEC
    );
    if (!ipWindow.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests from this network. Please try again later.",
          retryAfter: ipWindow.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // FORGOT_PASSWORD: don't reveal whether the account exists (anti-enumeration).
    // Students identify by email; clubs by their username OR verified email.
    if (purpose === "FORGOT_PASSWORD") {
      const user = await prisma.user.findUnique({ where: { email: identifier } });
      const club = await prisma.club.findUnique({
        where: { username: identifier },
      });
      const clubByEmail = club
        ? null
        : await prisma.club.findUnique({ where: { email: identifier } });
      if (!user && !club && !clubByEmail) {
        return NextResponse.json({
          success: true,
          message: "If the account exists, an OTP has been sent.",
        });
      }
    }

    await issueOtp(identifier, purpose);
    return NextResponse.json({
      success: true,
      message: "OTP sent to email.",
    });
  } catch (err) {
    console.error("[auth/otp/request]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
