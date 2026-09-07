import { hashPassword, verifyPassword } from "./src/lib/auth";

const pw = "password123";
const hashed = hashPassword(pw);
console.log("Hashed:", hashed);
console.log("Verify correct:", verifyPassword(pw, hashed));
console.log("Verify wrong:", verifyPassword("wrong", hashed));
