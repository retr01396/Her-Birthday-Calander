/**
 * Quick end-to-end email test.
 *
 * Sends a test message through the app's REAL configured transport — exactly
 * the same code path OTP emails use (src/lib/email.ts): Postal → generic SMTP
 * → dev console — so you can iterate on .env changes in seconds.
 *
 * Usage:
 *   npx tsx test-email.ts someone@cce.edu.in
 *
 * Interpretation:
 *   - "Transport: Postal …" and no error means Postal ACCEPTED the message.
 *     It does NOT mean it was delivered to the inbox.
 *   - Confirm real delivery in Postal's web UI (http://localhost:5000 →
 *     Server → Messages) — the worker may still bounce it later (e.g. Google's
 *     550 5.7.1 NotAuthorizedError for residential IPs / fake sender domains;
 *     see README §4 "Postal gotchas" and §8 Troubleshooting).
 */
import "dotenv/config";
import { sendEmail } from "./src/lib/email";

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("usage: npx tsx test-email.ts <recipient@example.com>");
    process.exit(1);
  }

  const transport = process.env.POSTAL_SMTP_HOST && process.env.POSTAL_FROM_EMAIL
    ? `Postal (${process.env.POSTAL_SMTP_HOST}:${process.env.POSTAL_SMTP_PORT ?? "587"})`
    : process.env.SMTP_HOST && process.env.EMAIL_FROM
      ? `generic SMTP (${process.env.SMTP_HOST})`
      : "dev console (no transport configured in .env)";

  console.log(`Transport: ${transport}`);
  console.log(`From:     ${process.env.POSTAL_FROM_EMAIL ?? process.env.EMAIL_FROM ?? "(none — dev console)"}`);
  console.log(`To:       ${to}\n`);

  try {
    await sendEmail({
      to,
      subject: "CampusHub test email — OTP delivery check",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Test email</h2>
          <p>If you can read this, OTP mail delivery is working for <strong>${to}</strong>.</p>
          <p>This was sent through the same transport the app uses for OTP codes.</p>
        </div>
      `,
    });
    console.log("\n✅ send() completed without error.");
    console.log("   For Postal this only means Postal ACCEPTED the message — check the");
    console.log("   Postal UI (http://localhost:5000 → Server → Messages) to confirm the");
    console.log("   worker delivered it to the recipient's MX.");
  } catch (err) {
    console.error("\n❌ send() failed:", err);
    process.exit(1);
  }
}

main();
