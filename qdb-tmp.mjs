import "dotenv/config";
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const users = await pool.query(`SELECT id, email, name, role, "onboardingCompleted" FROM "User" ORDER BY "createdAt" LIMIT 20`);
console.log("USERS:", JSON.stringify(users.rows, null, 1));
const clubCreds = await pool.query(`SELECT name, username, "passwordHash" FROM "Club" ORDER BY "createdAt"`);
console.log("CLUB_CREDS:", JSON.stringify(clubCreds.rows.map(r => ({ name: r.name, username: r.username, hashLen: r.passwordHash?.length, prefix: r.passwordHash?.slice(0, 12) })), null, 1));
await pool.end();
