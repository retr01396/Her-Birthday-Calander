import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

// ─── Seed ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding CampusHub database...");

  // Wipe existing data (safe for dev)
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.recruitmentGig.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  // ── System config ──
  await prisma.systemConfig.create({
    data: { key: "ACADEMIC_YEAR_START", value: "2025-07-01" },
  });

  // ── Admin only ──
  await prisma.user.create({
    data: {
      email: "admin@university.edu",
      name: "Campus Admin",
      handle: "campusadmin",
      password: hashPassword("admin123"),
      role: "SUPER_ADMIN",
      onboardingCompleted: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log("\n── Demo accounts ─────────────────────────");
  console.log("Admin:    admin@university.edu / admin123");
  console.log("───────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
