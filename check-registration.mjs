import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ev = await pool.query(
  `SELECT e.id, e.title, c.username FROM "Event" e JOIN "Club" c ON c.id = e."clubId" WHERE e.title = 'Kaggle Competition Kickoff'`
);
const row = ev.rows[0];
console.log("Event:", row.id, "|", row.title, "| club:", row.username);

const reg = await pool.query(
  `SELECT r.id, u.name, r.status, r."qrToken" FROM "Registration" r
   JOIN "User" u ON u.id = r."userId"
   WHERE r."eventId" = $1 AND u.email = $2`,
  [row.id, "aisha@university.edu"]
);
console.log("Aisha registration:", JSON.stringify(reg.rows[0], null, 2));

const total = await pool.query(
  `SELECT count(*)::int AS c FROM "Registration" WHERE "eventId" = $1`,
  [row.id]
);
console.log("Total registrations for this event:", total.rows[0].c);
await pool.end();
