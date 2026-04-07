import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createRawToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function createTokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
