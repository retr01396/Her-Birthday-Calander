import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 8000,
});

const users = await pool.query(
  `SELECT u.id, u.email, u.name, u.role FROM "User" u WHERE u.role IN ('CLUB_LEADER','SUPER_ADMIN') ORDER BY u."createdAt" DESC LIMIT 10`
);
console.log("Leaders/admins:", JSON.stringify(users.rows, null, 2));

const leaders = await pool.query(
  `SELECT cm."clubId", c.name as club, u.email, u.name as leader_name
   FROM "ClubMember" cm
   JOIN "Club" c ON c.id = cm."clubId"
   JOIN "User" u ON u.id = cm."userId"
   WHERE cm."clubRole" = 'LEADER' LIMIT 10`
);
console.log("Club leaders:", JSON.stringify(leaders.rows, null, 2));

await pool.end();
process.exit(0);
