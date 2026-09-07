# CampusHub-Demo
🎓 Campus Club Hub — A modern, high-performance web platform designed to centralize fragmented college club activities, streamline event pass management, and connect student talent through a collaboration gig board.

**Feature highlights**

- **Clubs** — public catalog, club profiles with logo/banner, self-publishing onboarding (unpublished → publish), event creation, announcements, member management.
- **Auth & OTP** — Redis-session sign-in, email **OTP verification** (student registration is blocked until the `@cce.edu.in` email is verified), **forgot password** for students and clubs (by email *or* club username), in-dashboard **change password** and **change email** (verified from both old and new addresses) for clubs, with **rate limiting + resend cooldown** on all OTP endpoints.
- **Email** — transactional mail via a self-hosted **Postal** server (or any SMTP server), with a zero-config **dev-console fallback** so no email server is needed to develop.
- **Students** — onboarding (academic details → email verify → club selection), event feeds, passes, leaderboard, professional-body memberships.

---

## 1. Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| **Node.js** | 20+ (built on 22) | Next.js 16 runtime. Install via [nvm](https://github.com/nvm-sh/nvm) (`nvm install 22`) or the Node website. |
| **npm** | 10+ (ships with Node) | Package manager. |
| **Docker Desktop** | Latest | Runs the Postgres + Redis containers via `docker-compose.yml`. (Windows: keep Docker Desktop running; it provides the Docker CLI + WSL backend.) |
| **Git** | Latest | Clone/push the repo. |
| Optional | — | A **Postal** mail server (or any SMTP account) if you want real email delivery — **not** required to run or develop. |

No global installs are needed — everything runs through the project's `node_modules` and Docker containers.

---

## 2. Quick start (run on a new device)

```bash
# 1. Clone
git clone <your-repo-url> campushub
cd campushub

# 2. Install dependencies (includes nodemailer + Prisma)
npm install

# 3. Start the infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# 4. Create your environment file
cp .env.example .env
#    → the .env.example defaults already match the docker-compose credentials,
#      so no edits are needed for local development

# 5. Apply the database schema (all migrations are committed)
npx prisma migrate deploy

# 6. Load demo data (admin, students, clubs, events)
npx prisma db seed

# 7. Start the dev server
npm run dev
```

Open **http://localhost:3000** — done. 🎉

> **Why `docker compose up -d postgres redis` and not just `up -d`?**
> The compose file also defines an *optional* Postal service (for real email). It's not required for development — starting only `postgres` and `redis` keeps the quick start clean. See [§4 – Email](#4-email--otp-three-modes) for Postal setup.

---

## 2b. Daily start — after a reboot

On your own machine you only do the full setup **once**. After a cold boot:

```bash
# 1. Start Docker Desktop (if it doesn't auto-start on login) and wait for the
#    whale icon to settle — it is NOT enough for the app to run without it.

# 2. All containers come back automatically (restart: always), data persists in
#    volumes. Wait until they're all "Up":
docker ps --format "{{.Names}} {{.Status}}"
#    expect: campushub_postgres, campushub_redis, postal-web, postal-worker,
#            postal-mariadb, postal-rabbitmq  (Postal ones only if you set it up)

# 3. Start the dev server (from the project folder):
set -a; source .env; set +a
npm run dev
#    → http://localhost:3000  (add `-- -p 56718` for a custom port)

# 4. Sanity-check it's live:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000   # → 200
```

No migration or seed is needed on reboot — the database already exists. Re-run `npx prisma migrate deploy` only after you `git pull` new migrations, and `npx prisma db seed` only if you want to reset demo data.

If the dev server or containers were left running from before the reboot, they're gone (or stale) — always start fresh with the steps above.

## 3. Project layout (what you're running)

```
prisma/          schema.prisma + committed migrations + seed.ts (demo data)
src/app/         Next.js App Router pages and API routes
  api/auth/      signin, register (OTP-gated), otp/{request,verify}, reset-password
  api/club/      publish, update-email (club dashboard flows)
  club/setup/    club self-publishing wizard
  club/login/    club login page
src/lib/         prisma, redis, session, auth (scrypt hashing),
                 otp, email, postal, rateLimit
src/components/  UI components (design-token system, no external UI kit)
```

Key pieces for new contributors:

- **`src/lib/email.ts`** — single dispatcher with 3 transport levels: **Postal → generic SMTP → dev console**.
- **`src/lib/postal.ts`** — Postal SMTP transport (used automatically when `POSTAL_SMTP_HOST` is set).
- **`src/lib/otp.ts`** — 6-digit OTP issue/verify/consume (scrypt-hashed, 10-min expiry, single-use action tokens).
- **`src/lib/rateLimit.ts`** — Redis-backed rate limits for OTP endpoints.
- **`prisma/seed.ts`** — demo accounts (see [§6](#6-demo-accounts)).

---

## 4. Email & OTP: three modes

OTP codes (registration verification, forgot password, club change-password/email) are delivered by **`src/lib/email.ts`**, which picks the first configured transport:

1. **Postal** — enabled when `POSTAL_SMTP_HOST` **and** `POSTAL_FROM_EMAIL` are set.
2. **Generic SMTP** — enabled when `SMTP_HOST` **and** `EMAIL_FROM` are set.
3. **Dev console** — no transport configured → the email (including the OTP code) is printed to the **dev-server terminal** (`[DEV EMAIL → …]`).

### Mode A — No email server (default, zero setup) ✅

Do **nothing** — `.env.example` ships with the email vars commented out, so `cp .env.example .env` leaves no transport configured. OTP codes then print to the terminal running `npm run dev`. Every OTP flow (register, forgot password, club setup) is fully testable this way — you read the 6-digit code from the console output and paste it into the form.

### Mode B — Postal (recommended for real email)

1. Run a Postal server (self-hosted; or use the optional service in `docker-compose.yml` — see the note below).
2. Add to `.env`:

   ```env
   POSTAL_SMTP_HOST="127.0.0.1"            # or postal.yourdomain.com
   POSTAL_SMTP_PORT="2525"                 # Postal SMTP port (2525 / 587 / 465)
   POSTAL_SMTP_USER="<server-api-key>"     # Postal uses the server's API key as the SMTP credential
   POSTAL_SMTP_PASS="<server-api-key>"
   POSTAL_FROM_EMAIL="no-reply@yourdomain.com"
   POSTAL_FROM_NAME="Campus Club Platform"
   ```

3. Restart the dev server. A successful send logs `Message sent via Postal: <id>` in the terminal.

**Postal gotchas (learned the hard way):**

- The SMTP credential is the Postal **server API key** (same value for user and pass), not a mailbox password.
- `postal web-server` starts **only** the web UI — you must also run `postal smtp-server` (e.g. `postal web-server & postal smtp-server & wait`) or SMTP connections will be accepted and then closed.
- Postal's SMTP process reads the `PORT` env var — don't share the web UI's `PORT` with it, or it will crash with `EADDRINUSE`.
- Create a `signing.key` (e.g. `openssl genrsa -out signing.key 2048`) and mount it into the web/worker containers, or the worker fails with `ENOENT/EACCES … /config/signing.key`.
- Delivery to a real inbox requires the sender domain to have **MX/SPF/DKIM** pointing at your Postal server (or a Postal route/webhook for local testing). Until then, Postal *accepts* mail (you'll see it in its message queue) but can't deliver it.
- **Gmail/Google Workspace bounces with `550 5.7.1 … NotAuthorizedError`** when mail comes from a residential/dynamic IP or a sender domain that doesn't exist in DNS — this is exactly what institutional mail (e.g. a college on Google Workspace) does to local setups. Two things must both be true before Google will accept direct mail: the sender domain must resolve with **SPF** (e.g. `v=spf1 ip4:<your-public-ip> -all`) and the sending IP must have a **PTR/reverse-DNS** record (only possible on a static server/VPS IP, not a home broadband line). If you can't get a clean static IP, use the authenticated relay path (Mode C) instead — e.g. your institution's Google Workspace relay (`smtp-relay.gmail.com`, needs Workspace admin approval) or any SMTP provider you have credentials for. Quick iteration: `npx tsx test-email.ts you@example.com`.

> The repo's `docker-compose.yml` includes an *experimental* Postal service (`postal`). It is **not** required for development and needs the setup above (config file, signing key, SMTP command/ports) before it's useful.

### Mode C — Any generic SMTP provider

If you'd rather use Gmail/Outlook/SendGrid SMTP instead of Postal:

```env
EMAIL_FROM="CampusHub <noreply@yourdomain.com>"
SMTP_HOST="smtp.yourprovider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
```

The app auto-switches to `nodemailer` for this path (it's already in `package.json`).

---

## 5. 🧑‍💻 Contributing WITHOUT Postal or nodemailer

**Yes — you can download, run, and contribute to this repo with no email server at all.** This is by design:

- **Nothing to install or configure.** `npm install` includes `nodemailer` (it's a normal dependency), but the app only *uses* it when you set `POSTAL_*` or `SMTP_*` in `.env`. With those unset, OTP emails are printed to the dev-server terminal — the whole app (registration with email verification, forgot password, club setup, change email) is fully usable.
- **Don't uninstall `nodemailer` or delete the Postal code.** It's harmless when unconfigured, and the point of the GitHub repo is to keep **every feature** — OTP auth, club email verification, change password/email, Postal transport, rate limiting — intact for everyone.
- **Pushing is normal.** Make your changes locally, commit, and push (or open a PR). Your commits are additive — they never remove `nodemailer` or the Postal integration from the main branch, because those live in the committed `package.json`, `src/lib/postal.ts`, `src/lib/email.ts`, etc.

Minimal contributor workflow:

```bash
git pull                     # get the latest (includes all features)
npm install                  # installs everything, incl. nodemailer
docker compose up -d postgres redis
cp .env.example .env
npx prisma migrate deploy
npx prisma db seed
npm run dev                  # OTPs appear in this terminal — no email server needed
# ... make your changes ...
git add -A && git commit -m "my change"
git push                     # or open a PR
```

---

## 6. Demo accounts

Created by `npx prisma db seed`:

| Account | Login | Password | Notes |
| --- | --- | --- | --- |
| Admin | `admin@university.edu` | `admin123` | Site admin |
| Student | `aisha@university.edu` | `password123` | + 11 more students (`daniel@`, `maya@`, …) |
| Club | `techsociety` | `password123` | + 5 more clubs (`datasciencesociety`, `cyberguild`, `roboticsai`, `creativemedia`, `entrepreneurshiphub`) |

Students sign in on `/login`; clubs on `/club/login` (username + password).

**Get the admin's ID (e.g. for API testing / admin endpoints):**

The password is stored **hashed** (scrypt), so it can never be read back from the database — the seeded value is `admin123` (use Forgot Password to reset it if it was changed). To look up the admin's ID, email and role from the running database:

```bash
docker exec campushub_postgres psql -U campus_admin -d campushub_db \
  -c "SELECT id, email, name, role FROM \"User\" WHERE email = 'admin@university.edu';"
```

Example output:

```
            id             |        email         |     name     |    role
---------------------------+----------------------+--------------+-------------
 cmsu1llit0001zcut8hgz0zys | admin@university.edu | Campus Admin | SUPER_ADMIN
```

Or browse everything visually with `npx prisma studio` (same command works to find any user's ID by email).

**Test the new features quickly:**

- **Email-verified registration:** `/login` → *Create Account* → fill step 1 → *Verify Email* (read the code from the terminal if no mail server) → pick 2 clubs + 1 professional body → done.
- **Forgot password:** `/forgot-password` — student by email, club by email or username.
- **Club setup wizard:** create a club as admin (`/admin`), sign in as it, and it's redirected to `/club/setup` (must verify its email + upload/preset branding before publishing).
- **Club dashboard security:** Profile tab → change password (OTP) / change email (OTP to old + new address).

---

## 7. Useful commands

```bash
npm run dev          # dev server (http://localhost:3000)
npm run build        # production build
npx prisma migrate deploy   # apply committed migrations
npx prisma db seed          # reset demo data (safe to re-run)
npx prisma studio           # browse the database
npx tsc --noEmit            # typecheck
```

---

## 8. Troubleshooting

| Problem | Fix |
| --- | --- |
| `PrismaClientInitializationError` / DB connection refused | Is Docker running? `docker compose up -d postgres redis`, then `npx prisma migrate deploy`. |
| `Redis is not available` / blank pages hang | Start Redis: `docker compose up -d redis`. The app uses Redis for auth sessions and rate limiting. |
| Port 5432/6379/3000 already in use | Change the mapping in `docker-compose.yml` (or `.env`), or stop the other service. |
| `migrate deploy` fails | Your local DB is out of sync with the committed migrations — after pulling, re-run `npx prisma migrate deploy` (it applies only the pending ones). |
| OTPs not arriving by email | Check `.env`: are `POSTAL_*`/`SMTP_*` set but wrong? If they're **unset**, codes print to the dev-server terminal instead. Look for `[DEV EMAIL → …]` or `Message sent via Postal: …` in the console. |
| Email **accepted by Postal but never arrives** (Gmail/Workspace bounce: `550 5.7.1 NotAuthorizedError`) | Postal *submitted* fine but Google rejected the outbound delivery: your sender domain has no SPF/DKIM and/or your public IP has no PTR record. Sending from a residential/college IP to Google-hosted mail will always fail — see §4 “Postal gotchas”. Fix: real domain + static server IP (VPS), or use the authenticated SMTP relay path (Mode C) with credentials you have. |
| Cloudinary image uploads fail | Uploads show a config hint when `NEXT_PUBLIC_CLOUDINARY_*` is missing — optional for local dev (club setup supports built-in color presets instead). |
| `npx tsc --noEmit` shows errors | Some pre-existing errors exist in legacy files (`points/`, `profile/`, `[...nextauth]` leftovers) — they don't block `npm run dev`. Keep new code error-free. |

---

## 9. Environment variables reference

See `.env.example` for the full template with comments.

| Var | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection (matches docker-compose) | `postgresql://campus_admin:supersecretpassword@localhost:5432/campushub_db?schema=public` |
| `REDIS_URL` | Redis connection for sessions + rate limiting | `redis://localhost:6379` |
| `POSTAL_SMTP_HOST/PORT/USER/PASS` | Postal transport (Mode B) | — |
| `POSTAL_FROM_EMAIL/FROM_NAME` | Postal sender identity (Mode B) | — |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | Generic SMTP transport (Mode C) | — |
| `EMAIL_FROM` | Generic SMTP sender (Mode C) | — |
| `NEXT_PUBLIC_CLOUDINARY_*`, `CLOUDINARY_*` | Image uploads (optional) | — |
