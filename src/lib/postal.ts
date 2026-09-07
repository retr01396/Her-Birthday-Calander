/**
 * Postal (self-hosted transactional mail server) transport.
 *
 * This is the PRIMARY email transport for OTP codes and other transactional
 * mail. Configured via POSTAL_* env vars (see .env / .env.example):
 *
 *   POSTAL_SMTP_HOST="127.0.0.1"           # or postal.yourdomain.com
 *   POSTAL_SMTP_PORT="2525"                # Postal SMTP port (2525 local, 587/465 prod)
 *   POSTAL_SMTP_USER="<server api key>"    # Postal uses the server key as the SMTP credential
 *   POSTAL_SMTP_PASS="<server api key>"
 *   POSTAL_FROM_EMAIL="no-reply@yourdomain.com"
 *   POSTAL_FROM_NAME="Campus Club Platform"
 *
 * Requires `npm install nodemailer`. nodemailer is an optional package, so it
 * is loaded through a runtime indirection (`new Function("import(...)")`) that
 * keeps the bundler from resolving the module at build time — a static import
 * here makes Turbopack/Next.js fail to compile when the package is absent.
 */

interface PostalEmailMessage {
  to: string;
  subject: string;
  html: string;
}

export function isPostalConfigured(): boolean {
  return Boolean(process.env.POSTAL_SMTP_HOST && process.env.POSTAL_FROM_EMAIL);
}

export async function sendPostalEmail({
  to,
  subject,
  html,
}: PostalEmailMessage): Promise<{ success: true; messageId: string }> {
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
      "POSTAL_SMTP_HOST is configured in .env but `nodemailer` is not installed. Run: npm install nodemailer"
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.POSTAL_SMTP_HOST,
    port: Number(process.env.POSTAL_SMTP_PORT || 587),
    secure: process.env.POSTAL_SMTP_PORT === "465", // true for 465 (SMTPS), false for 25/587/2525
    auth: process.env.POSTAL_SMTP_USER
      ? { user: process.env.POSTAL_SMTP_USER, pass: process.env.POSTAL_SMTP_PASS }
      : undefined,
    tls: {
      // Postal serves self-signed certificates on local installs. Only relax
      // verification for loopback hosts — production hosts keep full TLS checks.
      rejectUnauthorized: /^(127\.0\.0\.1|localhost|::1)$/.test(
        process.env.POSTAL_SMTP_HOST || ""
      ),
    },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.POSTAL_FROM_NAME || "Campus Club Platform"}" <${process.env.POSTAL_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  console.log("Message sent via Postal: %s", info.messageId);
  return { success: true, messageId: String(info.messageId) };
}
