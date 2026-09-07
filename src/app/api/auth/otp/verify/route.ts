import { NextResponse } from "next/server";
import { verifyOtp, OTP_PURPOSES, type OtpPurpose } from "@/lib/otp";
import {
  clientIp,
  rateLimit,
  countFailures,
  recordFailure,
  clearCounter,
  OTP_VERIFY_IP_LIMIT,
  OTP_VERIFY_MAX_FAILURES,
  OTP_VERIFY_FAIL_WINDOW_SEC,
  OTP_WINDOW_SEC,
} from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const purpose = body?.purpose as OtpPurpose | undefined;
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!identifier || !purpose || !OTP_PURPOSES.includes(purpose) || !otp) {
      return NextResponse.json(
        { error: "Email, purpose, and OTP are required." },
        { status: 400 }
      );
    }

    // ── Rate limiting (stops OTP brute-force) ──
    const ip = clientIp(req);

    // Per-IP cap across all identifiers (e.g. scanning many emails).
    const ipWindow = await rateLimit(
      `otp:verify:ip:${ip}`,
      OTP_VERIFY_IP_LIMIT,
      OTP_WINDOW_SEC
    );
    if (!ipWindow.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many verification attempts. Please try again later.",
          retryAfter: ipWindow.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // Per-identifier failure lock — checked BEFORE verifying so an already
    // locked address is rejected without spending another attempt.
    const failKey = `otp:verify:fail:${ip}:${identifier}`;
    const priorFailures = await countFailures(failKey);
    if (priorFailures >= OTP_VERIFY_MAX_FAILURES) {
      return NextResponse.json(
        {
          error:
            "Too many incorrect attempts. Please request a new code and try again later.",
        },
        { status: 429 }
      );
    }

    const result = await verifyOtp(identifier, purpose, otp);
    if (!result.success) {
      const { blocked, remaining } = await recordFailure(
        failKey,
        OTP_VERIFY_FAIL_WINDOW_SEC,
        OTP_VERIFY_MAX_FAILURES
      );
      if (blocked) {
        return NextResponse.json(
          {
            error:
              "Too many incorrect attempts. Please request a new code and try again later.",
            remaining: 0,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: result.error, remaining },
        { status: 400 }
      );
    }

    // Success clears the failure counter for this address.
    await clearCounter(failKey);

    return NextResponse.json({ success: true, actionToken: result.actionToken });
  } catch (err) {
    console.error("[auth/otp/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
