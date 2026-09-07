import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 10000,
});

const tables = ["User", "Event", "Registration", "ClubMember", "Pass"];
for (const t of tables) {
  const r = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
    [t]
  );
  console.log(`${t}: ${JSON.stringify(r.rows.map((x) => x.column_name))}`);
}
await pool.end();
process.exit(0);
