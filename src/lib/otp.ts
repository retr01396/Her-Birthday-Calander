import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./auth";
import { sendEmail } from "./email";

export type OtpPurpose =
  | "REGISTRATION"
  | "FORGOT_PASSWORD"
  | "CHANGE_PASSWORD"
  | "EMAIL_VERIFICATION";

export const OTP_PURPOSES: OtpPurpose[] = [
  "REGISTRATION",
  "FORGOT_PASSWORD",
  "CHANGE_PASSWORD",
  "EMAIL_VERIFICATION",
];

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const SUBJECT_MAP: Record<OtpPurpose, string> = {
  REGISTRATION: "Verify Your Email Registration — OTP Code",
  FORGOT_PASSWORD: "Reset Your Password — OTP Code",
  CHANGE_PASSWORD: "Change Your Password Authorization — OTP Code",
  EMAIL_VERIFICATION: "Verify Your Email — OTP Code",
};

/** Generate a 6-digit numeric OTP. */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Resolve the email address an OTP should be delivered to.
 *
 * `identifier` is a user's email address or a club's username. Users already
 * identify by email; clubs resolve to their stored `Club.email` so the code
 * reaches a real inbox. Falls back to the identifier itself (e.g. a brand-new
 * address being verified during onboarding, which is already an email).
 */
async function resolveDeliveryAddress(identifier: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email: identifier } });
  if (user) return user.email;
  const club = await prisma.club.findUnique({ where: { username: identifier } });
  if (club?.email) return club.email;
  return identifier;
}

/**
 * Generate a code for `identifier`, store a scrypt hash of it with a 10-minute
 * expiry, and dispatch it by email.
 *
 * `identifier` is a user's email address or a club's username — the same value
 * that must be passed to verify/reset.
 */
export async function issueOtp(
  identifier: string,
  purpose: OtpPurpose
): Promise<void> {
  // Replace any previous code for this identifier + purpose so only the
  // latest OTP is ever valid.
  await prisma.verificationToken.deleteMany({
    where: { email: identifier, purpose },
  });

  const code = generateOtp();

  await prisma.verificationToken.create({
    data: {
      email: identifier,
      purpose,
      code: hashPassword(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendEmail({
    to: await resolveDeliveryAddress(identifier),
    subject: SUBJECT_MAP[purpose],
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Verification Code</h2>
        <p>Your 6-digit OTP code for <strong>${purpose.replace(
          "_",
          " "
        )}</strong> is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; color: #2563eb;">${code}</h1>
        <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Verify a submitted code against the latest unexpired record for
 * (identifier, purpose). On success, issues a single-use action token that the
 * reset/complete step must present.
 */
export async function verifyOtp(
  identifier: string,
  purpose: OtpPurpose,
  code: string
): Promise<{ success: boolean; actionToken?: string; error?: string }> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      email: identifier,
      purpose,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "OTP has expired or is invalid." };
  }

  if (!verifyPassword(code, record.code)) {
    return { success: false, error: "Incorrect OTP entered." };
  }

  // Single-use authorization token for the action step.
  const actionToken = randomBytes(32).toString("hex");
  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { token: actionToken },
  });

  return { success: true, actionToken };
}

/**
 * Look up a valid (identifier, purpose) record by its action token, and
 * consume it immediately so it can never be replayed. Returns the record or
 * null when missing/expired/already used.
 */
export async function consumeOtpToken(
  identifier: string,
  purpose: OtpPurpose,
  actionToken: string
) {
  const record = await prisma.verificationToken.findFirst({
    where: {
      email: identifier,
      purpose,
      token: actionToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  await prisma.verificationToken.delete({ where: { id: record.id } });
  return record;
}
