/**
 * Email dispatcher — single entry point for all transactional mail (OTP codes,
 * notifications, …). Transport priority:
 *
 *   1. Postal (primary)   — enabled when POSTAL_SMTP_HOST + POSTAL_FROM_EMAIL
 *                           are set. See src/lib/postal.ts.
 *   2. Generic SMTP       — enabled when SMTP_HOST + EMAIL_FROM are set.
 *   3. Dev console        — no transport configured: the message (including
 *                           any OTP code) is printed to the server terminal so
 *                           every OTP flow stays testable without email infra.
 *
 * Postal is preferred whenever it is configured. The legacy SMTP_* block
 * remains as a fallback for setups that don't run Postal.
 */

import { sendPostalEmail, isPostalConfigured } from "./postal";

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailMessage): Promise<void> {
  // 1. Postal — primary transport.
  if (isPostalConfigured()) {
    // Identifiers without a real address (e.g. a club username for a club that
    // has no stored email yet) can't be delivered by SMTP — print to the
    // console instead of failing the request with EENVELOPE.
    if (!to.includes("@")) {
      const text = html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      console.log(`\n[DEV EMAIL → ${to}] ${subject}\n${text}\n`);
      return;
    }
    const result = await sendPostalEmail({ to, subject, html });
    console.log(`[Postal → ${to}] ${subject} (${result.messageId})`);
    return;
  }

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.EMAIL_FROM
  );

  if (!smtpConfigured) {
    // 3. Dev fallback — the OTP appears in the server terminal output.
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    console.log(`\n[DEV EMAIL → ${to}] ${subject}\n${text}\n`);
    return;
  }

  // 2. Legacy generic SMTP transport (requires `npm install nodemailer`).
  // nodemailer is an optional package, so load it through an indirection that
  // keeps the bundler from resolving the module at build time.
  let nodemailer: any;
  try {
    const importer = new Function(
      "specifier",
      "return import(specifier)"
    ) as (specifier: string) => Promise<any>;
    const mod = await importer("nodemailer");
    nodemailer = mod?.default ?? mod;
  } catch {
    throw new Error(
      "SMTP_* is configured in .env but `nodemailer` is not installed. Run: npm install nodemailer"
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
