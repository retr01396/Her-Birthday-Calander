# CampusHub — Complete UI Reference for Redesign

> Generated: August 23, 2026
> This document captures every page's UI copy, layout structure, and screenshot
> for reference during the redesign.

---

## 1. HOME PAGE (`/`)

**Screenshot:** `screenshots/home.png`

### Navbar (sticky)
- **Logo:** "CampusHub" (link to `/`)
- **Nav Links:** Dashboard, Feed, Leaderboard, Clubs
- **Icons:** Notifications bell, Settings gear
- **CTA:** "Sign in" button (pill-shaped, primary color)

### Hero Section
- **Background:** Animated 3D sphere pattern on blue gradient
- **Heading:** "The Hub of Campus Innovation"
- **Subheading:** "Connect with professional bodies, discover cutting-edge events, and build your technical network in a high-performance ecosystem."
- **CTA 1:** "Explore Clubs" (white pill button)
- **CTA 2:** "View Leaderboard" (outlined pill button)

### Scrolling Club Ticker
- Horizontal auto-scrolling marquee of club names:
  CREATIVE MEDIA SOCIETY · CYBER SECURITY GUILD · DATA SCIENCE SOCIETY · ENTREPRENEURSHIP HUB · ROBOTICS & AI CLUB · TECH INNOVATORS SOCIETY

### Campus Events Section
- **Heading:** "Campus Events"
- **Subheading:** "Browse upcoming events, your registered passes, and saved bookmarks."
- **Tab Filters:** "Upcoming Events", "My Upcoming Events", "Saved Upcoming Events"

### Event Cards (repeated pattern)
Each event card shows:
- Status badge (e.g., "SOON")
- Bookmark button
- Event type badge (COMPETITION, WORKSHOP, CTF, HACKATHON, PITCH)
- Club icon + club name
- Event title (heading)
- Description
- Date/time with calendar icon
- Location with map pin icon
- Capacity bar (e.g., "6/40")
- "Register Now" link with arrow

**Sample Events:**
1. **Kaggle Competition Kickoff** — Data Science Society — "Team up and start your first Kaggle competition." — Tue, Aug 25, 2026, 03:00 PM — Library, Data Lab — Capacity 6/40
2. **Photography Walk & Shoot** — Creative Media Society — "Golden-hour photo walk across campus." — Wed, Aug 26, 2026, 04:00 PM — Botanical Gardens — Capacity 6/35
3. **Web Development Bootcamp** — Tech Innovators Society — "Two-day intensive bootcamp covering React, Next.js and deployment." — Thu, Aug 27, 2026, 09:00 AM — Engineering Building, Lab 3 — Capacity 6/80
4. **Capture The Flag: Beginner Night** — Cyber Security Guild — "Friendly CTF for beginners with hints and walkthroughs." — Fri, Aug 28, 2026, 05:00 PM — Engineering Building, Lab 5 — Capacity 6/50
5. **Machine Learning 101** — Data Science Society — "From linear regression to neural networks — a practical intro." — Sun, Aug 30, 2026, 10:00 AM — Science Complex, Room 204 — Capacity 6/70
6. **Drone Build Workshop** — Robotics & AI Club — "Assemble and fly your own FPV drone." — Mon, Aug 31, 2026, 09:00 AM — Makerspace, Workshop Bay 2 — Capacity 6/25
7. **HackFest 2026** — Tech Innovators Society — "24-hour hackathon with prizes, mentors and free food." — Thu, Sep 3, 2026, 09:00 AM — Innovation Hub — Capacity 6/120
8. **Startup Pitch Night** — Entrepreneurship Hub — "Watch 8 student startups pitch to real investors." — Sun, Sep 6, 2026, 05:00 PM — Innovation Hub, Main Stage — Capacity 6/150

### Footer
- **Brand:** "CampusHub"
- **Tagline:** "© 2026 CampusHub. Built for campus innovation."
- **Links:** Privacy, Terms, Support, Twitter, GitHub

---

## 2. LOGIN PAGE (`/login`)

**Screenshot:** `screenshots/login.png`

### Layout
- Centered card on light gray background
- CampusHub logo (blue square with lightning bolt) + "campushub" text

### Tab Toggle
- **"Sign In"** (active, blue fill)
- **"Create Account"** (inactive, outlined)

### Sign In Form
- **Heading:** "Welcome back"
- **Subheading:** "Sign in with your campus email to access events, clubs, and passes."
- **Field 1:** "Campus Email" — placeholder: "student@cce.edu.in"
- **Info Note:** ⓘ "Club representatives sign in with their club username on the club login page."
- **Field 2:** "Password" — with show/hide toggle (eye icon)
- **Link:** "Forgot password?" (right-aligned, blue)
- **CTA:** "Sign In to Dashboard" (full-width blue button)

### Footer Section
- "New to CampusHub? **Create an account**"
- 🏛️ "Are you a club account? **Club login →**"

---

## 3. FORGOT PASSWORD PAGE (`/forgot-password`)

**Screenshot:** `screenshots/forgot-password.png`

### Layout
- Centered card matching login style
- CampusHub logo + "campushub"

### Tab Toggle
- **"Student / Admin"** (active, blue)
- **"Club"** (inactive)

### Steps Indicator
- **1. Request** → **2. Verify** → **3. New password**

### Form
- **Heading:** "Reset your password"
- **Subheading:** "Enter your registered campus email and we'll send a 6-digit code."
- **Field:** "Campus Email" — placeholder: "student@cce.edu.in" (with mail icon)
- **CTA:** "Send OTP Code →" (full-width blue button)

### Footer
- "← Back to student login"

---

## 4. CLUBS LISTING PAGE (`/clubs`)

**Screenshot:** `screenshots/clubs.png`

### Page Header
- **Heading:** "Browse Clubs"
- **Subheading:** "Discover communities that match your passion, from technical engineering guilds to creative arts collectives."

### Search & Filter Bar
- **Search:** placeholder "Search by name, category, or interest..."
- **View Toggle:** Grid / List icons
- **Filter Button:** "Filters" with icon

### Category Tags
- All Clubs (active/blue), Design, AI & ML, Entrepreneurship, Robotics, Music

### Section: "Professional Bodies & Technical Chapters"

#### Club Cards (3-column grid):
Each card shows:
- Club icon (building icon in blue square)
- "CLUB" badge
- Club name (heading)
- Members count with people icon (e.g., "0 Members")
- Tagline
- "View Profile" link with external link icon
- "Closed" button (lock icon, disabled state)

**Clubs:**
1. **Data Science Society** — "Turning data into decisions"
2. **Tech Innovators Society** — "Building tomorrow's technology leaders"
3. **Cyber Security Guild** — "Hack the planet (ethically)"

### Section: "Student Interest Clubs"
Same card layout:

4. **Entrepreneurship Hub** — "From idea to IPO"
5. **Robotics & AI Club** — "Where hardware meets intelligence"
6. **Creative Media Society** — "Visual storytelling, amplified"

### Load More
- "Load More Clubs" link at bottom

### Footer
- **Brand:** "campushub"
- **Tagline:** "© 2024 campushub. Built for builders."
- **Links:** Privacy, Terms, Support, Twitter, GitHub

---

## 5. FEED PAGE (`/feed`)

**Screenshot:** `screenshots/feed.png`

### Page Header
- **Heading:** "Club Feed"
- **Subheading:** "Discover updates, events, and highlights from clubs across the campus."

### Filter Tabs
- **All Posts** (active/blue pill)
- Winner Highlights
- Event Recaps
- Announcements

### Club Filter Dropdown
- Select: "All Clubs" with options: Tech Innovators Society, Data Science Society, Cyber Security Guild, Robotics & AI Club, Creative Media Society, Entrepreneurship Hub

### Empty State
- Icon (document/newspaper)
- **"No posts found"**
- "Check back later for new updates."

---

## 6. LEADERBOARD PAGE (`/leaderboard`)

**Screenshot:** `screenshots/leaderboard.png`

### Hero Badge
- "✨ LIVE RANKINGS" (blue badge)

### Page Header
- **Heading:** "Leaderboard"
- **Subheading:** "Recognizing excellence across the campus ecosystem — computed live from real event registrations and club activity."

### View Toggle
- **Students** (active, blue with trophy icon)
- **Clubs** (inactive, with building icon)

### Points Explainer Card: "How Student Points Work"
| Icon | Action | Points | Note |
|------|--------|--------|------|
| 🎟️ | Event Attendance | +10 pts | Verified via QR check-in |
| 🥇 | 1st Place Winner | +50 pts | At event finalization |
| 🥈 | 2nd Place Winner | +30 pts | At event finalization |
| 🥉 | 3rd Place Winner | +20 pts | At event finalization |

### Top 3 Podium (cards with rank badges)
1. **#2 — Grace Kim** — Artificial Intelligence · Year 3rd Year — **310 pts** — 1 EVENT, 2 CLUBS — Badge: "FIRST TIMER"
2. **#1 — Aisha Bello** — Computer Science · Year 3rd Year — **340 pts** — 5 EVENTS, 2 CLUBS — Badge: "EVENT CHAMPION" (highlighted/larger card)
3. **#3 — Daniel Okafor** — Software Engineering · Year 4th Year — **290 pts** — 2 EVENTS, 2 CLUBS — Badge: "ACTIVE PARTICIPANT"

### Full Rankings Table (Ranks 4-12)
| Rank | Student Name | Department | Activity | Impact Points |
|------|-------------|------------|----------|---------------|
| 04 | Fatima Yusuf | Cyber Security | 1 EVENTS, 2 CLUBS | 275 |
| 05 | Emeka Nwosu | Electrical Engineering | 1 EVENTS, 1 CLUBS | 260 |
| 06 | Tunde Bakare | Software Engineering | 1 EVENTS, 2 CLUBS | 240 |
| 07 | Maya Chen | Information Systems | 2 EVENTS, 2 CLUBS | 225 |
| 08 | Priya Sharma | Information Systems | 1 EVENTS, 2 CLUBS | 195 |
| 09 | James Adeyemi | Mechanical Engineering | 5 EVENTS, 2 CLUBS | 180 |
| 10 | Liam O'Connor | Data Science | 2 EVENTS, 2 CLUBS | 150 |
| 11 | Sofia Martinez | Computer Science | 5 EVENTS, 2 CLUBS | 90 |
| 12 | Omar Haddad | Computer Science | 5 EVENTS, 2 CLUBS | 60 |

---

## 7. CLUB LOGIN PAGE (`/club/login`)

**Screenshot:** `screenshots/club-login.png`

### Layout
- Centered card, same styling as student login
- CampusHub logo (with building icon variant) + "campushub"

### Info Banner
- ⓘ "Club accounts are provisioned and managed by CampusHub administrators. Use the username and password shared with your club lead."

### Form
- **Heading:** "Club Representative Portal"
- **Subheading:** "Manage your club profile, events, scanner, and leaderboard points."
- **Field 1:** "Club Username" — placeholder: "e.g. ieee, acm, gdsc"
- **Info Note:** ⓘ "New clubs start in a draft state — after signing in you'll be guided through publishing your club profile."
- **Field 2:** "Club Password" — with show/hide toggle
- **Link:** "Forgot password?" (right-aligned, blue)
- **CTA:** "Sign In as Club" (full-width blue button)

### Footer
- 🎓 "Are you a Student or Admin? **Login here →**"

---

## 8. ONBOARDING PAGE (`/onboarding`)

*(Requires authentication — captured from source code)*

### Header
- **Logo:** "CampusHub" (blue text)
- **Nav:** "Onboarding" (active, underlined blue)

### Progress Indicator
- **1. Academic Details** (active, blue pill) → **2. Club Selection** (gray)

### Header Text
- **Heading:** "Welcome! Let's set up your profile"
- **Subheading:** "Enter your university details to personalize your workspace."

### Form Card: Academic Details
- **Field 1:** "Full Name" — placeholder: "e.g. Jane Doe"
- **Field 2:** "Academic Year" — dropdown: Select Year, 1st Year, 2nd Year, 3rd Year, 4th Year
- **Field 3:** "Department" — dropdown with departments
- **Field 4:** "Division / Batch" — dropdown (dependent on department)
- **CTA:** "Continue to Club Selection →" (full-width blue pill button)
- **Trust badges:** "Secure · University Verified"

### Step 2 (Club Selection)
Component: `Step2OrganizationSelection` — selects professional body and general clubs

---

## 9. DASHBOARD PAGE (`/dashboard`)

*(Redirects to `/` — the main page IS the dashboard)*

---

## 10. ADMIN PANEL (`/admin`)

*(Requires SUPER_ADMIN auth — captured from source code)*

### Header
- **Icon:** Shield check in violet circle
- **Heading:** "Admin Panel"
- **Subheading:** "Welcome back, {name}. Manage the campus ecosystem."

### Stats Cards (4-column grid)
| Stat | Icon |
|------|------|
| Total Clubs | Building icon (violet) |
| Total Students | Users icon (violet) |
| Total Events | Calendar icon (violet) |
| Registrations | Ticket icon (violet) |

### Quick Links (3-column grid of cards)
| Card | Description | Color Theme |
|------|-------------|-------------|
| **Manage Users** | View the user roster and manage roles | Violet |
| **Manage Clubs** | Create campus clubs and manage their accounts | Emerald |
| **System Config** | Set academic year and global variables | Slate |
| **Reports & Analytics** | Participation analytics, CSV exports, and pending onboarding tracker | Blue |
| **Verify Submissions** | Approve, reject, or revert club-submitted external event points | Amber |

---

## 11. ADMIN — MANAGE USERS (`/admin/users`)

### Header
- **Heading:** "Student Management"
- **Counter:** "X Registered Students" (with pulsing green dot)

### Content
- Table with filters for department, year, division
- Search by name/email
- Actions: view, edit role, etc.

---

## 12. ADMIN — MANAGE CLUBS (`/admin/clubs`)

### Header
- **Heading:** "Manage Clubs"
- **Subheading:** "Create new campus clubs and manage their accounts."
- **Link:** "← Back to Admin"

### Create Club CTA
- Dashed border card with key icon
- **Title:** "Create New Club Account"
- **Description:** "Generate a unique club username & password for login access."
- **CTA:** "Go →"

### Clubs List
Each club card shows:
- Building icon (emerald)
- Club name + status badges (Suspended, Draft/Unpublished, category)
- Description
- Events count, members count, @username
- Created date
- Action: "Awaiting club setup" or "View Page" with settings icon

### Empty State
- "No clubs created yet"
- "Click above to create your first club and its login credentials."

---

## 13. ADMIN — CREATE CLUB (`/admin/clubs/create`)

### Form
- Club name, description, category fields
- Auto-generated username/password
- Save button

---

## 14. ADMIN — SYSTEM CONFIG (`/admin/config`)

### Header
- **Icon:** Settings gear in slate circle
- **Heading:** "System Config"
- **Subheading:** "Global variables used across the platform."
- **Link:** "← Back to Admin"

### Form Card
- **Field:** "Academic Year Start" — date picker
- **Description:** "Used by the leaderboard to compute yearly activity windows. Stored in the `SystemConfig` table."
- **CTA:** "Save Config" (blue button)

---

## 15. ADMIN — REPORTS & ANALYTICS (`/admin/reports`)

### Header
- **Heading:** "Admin Reports & Analytics"
- **Counter:** "X Students in Report" or "X Onboarding Pending"
- **CTA:** "Export CSV" (blue button)

### Tabs
- **Participation Analytics** (active)
- **Pending Onboarding**

### Filter Bar
- **Class** dropdown (All Classes + specific department/division combos)
- **Class Year** dropdown (All Years, 1st-4th)
- **Timeline** dropdown (Last Month, Last 3 Months, Last 6 Months, All Time)
- **Sort By** dropdown (Events Participated, Name, Handle)
- **Sort Order** button (Highest First / Lowest First)

### Participation Table
| Student | Class | Top Result | Attended Events |
|---------|-------|------------|-----------------|
| Name + handle/email | Department badge + email | 🥇/🥈/🥉 or "—" | N Events badge + pts |

### Pending Onboarding Table
| Student | Assigned Class | Created Date | Status |
|---------|---------------|--------------|--------|
| Name (or "Unassigned") + handle | Class + year or "Pending" + email | Date | "Onboarding Pending" badge |

---

## 16. ADMIN — VERIFY SUBMISSIONS (`/admin/submissions`)

### Header (Dark themed — slate-900 background)
- **Badge:** "Admin Verification Center" (indigo)
- **Heading:** "External Event Verifications"
- **Description:** "Clubs submit MakeMyPass / offline attendance lists here. Verify the email breakdown, approve to credit points, or revert a decision to roll points back — everything is logged."

### Filter Tabs (dark pills)
- All, Pending, Approved, Rejected, Reverted

### Verification Cards (per event)
Each card shows:
- Club icon + event title + status badge
- "Submitted by {club name}" + date + registration link
- Club points balance

**Breakdown Grid (4 stats):**
| Metric | Description |
|--------|-------------|
| Uploaded Emails | from club CSV |
| Matched Students | N unmatched |
| Student Points | preview if approved |
| Club Host Bonus | 50 base + 2 per matched |

**Actions:**
- **Pending:** "Approve & Credit Points" (green) + "Reject" (red)
- **Approved:** "Revert Event Points" (dark)
- **Rejected:** "Rejected — no points were credited. The club can fix the list and resubmit."
- **Reverted:** "Reverted — all credited points were deducted and ledger entries marked REVERTED."

### Inspect Modal
- "Attendee Audit — {event title}"
- Stats: N uploaded · N would match · N unmatched
- Table: #, Email, Name, Position (🥇/🥈/🥉), Points, Match status (Credited/Would match/Unmatched)

---

## 17. CLUB DASHBOARD (`/club/dashboard`)

*(Requires CLUB or SUPER_ADMIN auth — captured from source code)*

### Header Banner (dark slate-900)
- Club logo/avatar + club name + @username badge
- Tagline (or "Club Dashboard Management Portal")
- **Action Buttons:**
  - "Create Feed Post" (primary, with Plus icon)
  - "Roster Studio" (white/10, with Users icon)
  - "Applications" (with badge count for pending)
  - "View Public Page" (external link, Globe icon)

### Tab Navigation
| Tab | Icon |
|-----|------|
| Events Manager (N) | Calendar |
| Roster & Executive Roles (N) | Users |
| Profile & About Editor | FileText |

### Tab 1: Events Manager
- **Heading:** "Club Events"
- **Subheading:** "Post and manage upcoming workshops, competitions, and meetups."
- **Actions:** "Attendance & Points" (trophy icon) + "Create Event" (primary)

#### Event Cards (3-column grid)
Each shows:
- Cover image or title initial
- Status badge (PUBLISHED)
- Date/time
- Title + description
- Location (map pin)
- Capacity: N seats + Fee
- "Edit Event Details" button
- "Finalize Event" button (or "Finalized" badge if closed)
- Quick links: Form, Scanner, Analytics/Applications

#### Empty State
- Calendar icon
- "No events posted yet"
- "Create your first club event to display it on the public club page and student event feed."
- "Create Event Now" button

### Tab 2: Roster & Executive Roles
- **Heading:** "Club Roster & Executive Team"
- **Subheading:** "Manage enrolled student members and assign leadership roles (e.g. Vice President, Tech Lead). Executive roles are showcased on the public About page."
- **Search:** "Search member name or email..."

#### Roster Table
| Student Name | Department & Year | Assigned Role Title | Leadership Tag | Actions |
|-------------|-------------------|--------------------|----------------|---------|
| Name + email | Department (Year) | Role (or "Member") | Executive Leader badge / General Member | Edit Role / Save |

#### Expandable Row
- "Details Filled at Joining" section
- Application form answers in a grid

### Tab 3: Profile & About Editor
- **Heading:** "Profile & About Editor"
- **Subheading:** "Update your club tagline, branding visuals, and Markdown About section."

#### Form Fields
- **Tagline** — text input
- **Logo Image** — upload component
- **Banner Image** — upload component
- **Recruitment Status** — dropdown: "Open for Members", "Recruiting Board / Execs", "Closed / Not Recruiting"
- **About Club (Markdown Support)** — textarea
- **CTA:** "Save Profile & About Info" (primary button)

#### Additional Cards
- **Membership Form Settings** — custom form fields, WhatsApp group URL, membership approval toggle
- **Club Email** — OTP-verified email changes
- **Change Password** — OTP-authorized password change

### Event Create/Edit Modal
- **Heading:** "Create New Club Event" / "Edit Event"
- **Fields:** Event Title, Description, Location, Date, Start Time, Capacity (Seats), Fee (₹), Show capacity toggle, Cover Image
- **Actions:** Cancel + Save Event

---

## 18. CLUB SETUP WIZARD (`/club/setup`)

*(Requires CLUB auth with UNPUBLISHED status)*

### Layout
- Navbar with club name
- Centered wizard interface
- Multi-step form for publishing club profile (tagline, about, logo, category, etc.)

---

## 19. CLUB SUB-PAGES

### Club Roster (`/club/dashboard/roster`)
- Dedicated full-page roster management
- Search, filter, edit member roles
- Executive tagging

### Club Points (`/club/dashboard/points`)
- Attendance tracking and points management
- Points ledger view

### Club Applications (`/club/dashboard/applications`)
- Pending membership applications
- Approve/reject applications with form review

### Club Feed Create (`/club/dashboard/feed/create`)
- Post creation form
- Post type (Winner Highlights, Event Recaps, Announcements)
- Rich text/content editor

### Club Events Create (`/club/dashboard/events/create`)
- Full event creation page with all fields

### Event Form Builder (`/club/dashboard/events/[eventId]/form-builder`)
- Custom registration form field builder

### Event Responses (`/club/dashboard/events/[eventId]/responses`)
- Registration responses and attendance data

### Event Scanner (`/club/dashboard/events/[eventId]/scanner`)
- QR code scanner for event check-in

---

## 20. EVENT DETAIL PAGE (`/events/[eventId]`)

*(Requires database data — captured from home page event cards as reference)*

### Layout (from event card pattern)
- Event cover image
- Event type badge
- Club name + icon
- Event title (heading)
- Description
- Date/time
- Location
- Capacity bar
- Registration CTA

---

## 21. EVENT REGISTRATION PAGE (`/events/[eventId]/register`)

*(Requires event ID — registration flow)*

---

## 22. CLUB PUBLIC PROFILE (`/clubs/[slug]`)

*(Requires database data — from source code)*

### Layout
- **ClubProfileHeader** component — logo, name, tagline, cover image
- Members count
- Upcoming events count
- About section (Markdown rendered)
- **PublicRoster** — visible club members
- Social links: Globe, GitHub, Instagram, MessageCircle, ExternalLink
- Leadership section with crown icons

---

## 23. CLUB EVENTS PAGE (`/clubs/[slug]/events`)

### Layout
- Filtered events list for a specific club

---

## 24. CLUB FEED PAGE (`/clubs/[slug]/feed`)

### Layout
- Club-specific feed posts

---

## DESIGN TOKENS / STYLE NOTES

### Colors (from Tailwind classes used)
- **Primary:** `#3C7BFF` / `#004fd9` (blue)
- **Background:** `#F8FAFC` / `#faf8ff` (light gray/purple tint)
- **Surface:** White
- **Text:** `#1E293B` (headings), `#64748b` (secondary), `#94a3b8` (muted)
- **Success:** Emerald tones
- **Warning:** Amber tones
- **Error:** Rose/Red tones
- **Accent:** Violet (admin), Indigo (verification center)

### Typography (from class patterns)
- Headings: `font-black tracking-tight` (extra bold)
- Body: `font-medium` to `font-semibold`
- Labels: `text-xs font-bold uppercase tracking-wider`
- Mono: `font-mono` (for usernames, code)

### Components
- **Cards:** `rounded-2xl` to `rounded-3xl`, `border border-slate-200`, `shadow-sm`
- **Buttons:** `rounded-xl` to `rounded-full`, `font-bold`
- **Input Fields:** `rounded-xl`, `border border-slate-200`, focus ring
- **Badges:** `rounded-full`, `text-xs font-bold`
- **Nav:** Pill-shaped buttons, `backdrop-blur-md`

### Border Radius Scale
- `rounded-xl` (12px) — buttons, inputs
- `rounded-2xl` (16px) — cards
- `rounded-3xl` (24px) — large cards, modals
- `rounded-full` — pills, badges, avatars

### Shadows
- `shadow-sm` — cards
- `shadow-md` — buttons
- `shadow-lg` — banners
- `shadow-2xl` — modals
