import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 15000,
});

// Same statements as prisma/migrations/20260812000000_add_club_member_roles/migration.sql
const sql = `
ALTER TABLE "ClubMember" ADD COLUMN IF NOT EXISTS "roleTitle" TEXT DEFAULT 'Member';
ALTER TABLE "ClubMember" ADD COLUMN IF NOT EXISTS "isExecutive" BOOLEAN NOT NULL DEFAULT false;
`;

try {
  await pool.query(sql);
  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'ClubMember' ORDER BY ordinal_position`
  );
  console.log("ClubMember columns:", JSON.stringify(cols.rows.map((r) => r.column_name)));
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error("Migration failed:", err.message);
  await pool.end();
  process.exit(1);
}
