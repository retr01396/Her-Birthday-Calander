import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 8000,
});

const r = await pool.query(
  `SELECT name, "recruitmentStatus" FROM "Club" WHERE id = 'cms1cope00002wkut7v6fip5z'`
);
console.log("Music club:", JSON.stringify(r.rows));

await pool.end();
process.exit(0);
