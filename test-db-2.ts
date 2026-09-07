import { config } from 'dotenv';
config();
console.log("DB URL:", process.env.DATABASE_URL);

import { parse } from 'pg-connection-string';
console.log("Parsed:", parse(process.env.DATABASE_URL || ""));

import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(console.log).catch(console.error).finally(() => pool.end());
