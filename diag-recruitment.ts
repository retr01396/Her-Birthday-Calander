import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  // Check which Club columns exist in the database
  const cols = (await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'Club' ORDER BY ordinal_position`
  )) as { column_name: string; data_type: string; column_default: string | null }[];

  console.log("Club columns:");
  for (const c of cols) {
    console.log(`  - ${c.column_name} (${c.data_type})${c.column_default ? ` default=${c.column_default}` : ""}`);
  }

  const hasRecruitment = cols.some((c) => c.column_name === "recruitmentStatus");
  console.log("\nrecruitmentStatus column exists:", hasRecruitment);

  // Show a sample club's current recruitment status
  const sample = await prisma.club.findFirst({
    select: { id: true, name: true, slug: true, recruitmentStatus: true },
  });
  console.log("\nSample club:", sample);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("DIAG ERROR:", e);
  process.exit(1);
});
