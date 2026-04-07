import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "jose";
import { appConfig } from "@/lib/env";

export const AUTH_COOKIE_NAME = "lume_session";
export type SessionRole = "CUSTOMER" | "ADMIN";

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  sessionId: string;
  role: SessionRole;
  email: string;
  fullName: string;
}

const secret = new TextEncoder().encode(appConfig.authSecret);

export async function signAuthToken(
  payload: AuthTokenPayload,
  expiresAt: Date,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
