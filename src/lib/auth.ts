import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 32;
const SEPARATOR = ":";

/**
 * Hash a password using scrypt with a random salt.
 * Returns a string in the format "salt:hash" (both hex-encoded).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return salt + SEPARATOR + derivedKey.toString("hex");
}

/**
 * Verify a password against a stored hash string.
 */
export function verifyPassword(
  password: string,
  stored: string
): boolean {
  const separatorIndex = stored.indexOf(SEPARATOR);
  if (separatorIndex === -1) return false;

  const salt = stored.slice(0, separatorIndex);
  const keyHex = stored.slice(separatorIndex + 1);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);

  const storedBuffer = Buffer.from(keyHex, "hex");
  if (storedBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(storedBuffer, derivedKey);
}
