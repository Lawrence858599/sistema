import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/env";
import { userRepository } from "@/repositories/user-repository";
import { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken } from "@/lib/auth/token";
import type { Role, SessionUser } from "@/types/domain";

function getSessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + appConfig.sessionDurationInDays);
  return expiresAt;
}

export async function createUserSession(user: SessionUser) {
  const expiresAt = getSessionExpiryDate();
  const session = await userRepository.createSession(user.id, expiresAt);
  const token = await signAuthToken(
    {
      sub: user.id,
      sessionId: session.id,
      role: user.role as Role,
      email: user.email,
      fullName: user.fullName,
    },
    expiresAt,
  );

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: appConfig.isProduction,
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (currentToken) {
    const payload = await verifyAuthToken(currentToken);
    if (payload?.sessionId) {
      await userRepository.deleteSession(payload.sessionId);
    }
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload?.sessionId || typeof payload.sub !== "string") {
    return null;
  }

  const user = await userRepository.findSessionUser(payload.sessionId, payload.sub);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as Role,
  } satisfies SessionUser;
}

export async function requireUser(nextPath = "/account") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
