import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 8000,
});

const cols = await pool.query(
  `SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'Club' ORDER BY ordinal_position`
);
console.log("Club columns:");
for (const r of cols.rows) {
  console.log(`  - ${r.column_name}${r.column_default ? ` (default=${r.column_default})` : ""}`);
}

const hasRecruitment = cols.rows.some((c) => c.column_name === "recruitmentStatus");
console.log("\nrecruitmentStatus exists:", hasRecruitment);

const sample = await pool.query(
  `SELECT id, name, slug, "recruitmentStatus" FROM "Club" ORDER BY "createdAt" DESC LIMIT 3`
);
console.log("\nSample clubs:", JSON.stringify(sample.rows, null, 2));

await pool.end();
process.exit(0);
