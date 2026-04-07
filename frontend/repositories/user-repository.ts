import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/types/domain";
import { normalizeOptionalString } from "@/utils/strings";

function hasCompleteAddress(input: ProfileInput) {
  return Boolean(input.line1 && input.city && input.state && input.postalCode);
}

function getAddressPayload(input: ProfileInput) {
  if (!hasCompleteAddress(input)) {
    return undefined;
  }

  return {
    recipientName: normalizeOptionalString(input.recipientName) ?? input.fullName,
    line1: input.line1!.trim(),
    line2: normalizeOptionalString(input.line2),
    district: normalizeOptionalString(input.district),
    city: input.city!.trim(),
    state: input.state!.trim(),
    postalCode: input.postalCode!.trim(),
    country: normalizeOptionalString(input.country) ?? "Brasil",
  };
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { address: true },
    });
  },

  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });
  },

  createUser(data: { fullName: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        cart: {
          create: {},
        },
      },
      include: { address: true },
    });
  },

  updateProfile(userId: string, input: ProfileInput) {
    const addressPayload = getAddressPayload(input);

    return prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        phone: normalizeOptionalString(input.phone),
        documentValue: normalizeOptionalString(input.documentValue),
        ...(addressPayload
          ? {
              address: {
                upsert: {
                  create: addressPayload,
                  update: addressPayload,
                },
              },
            }
          : {}),
      },
      include: { address: true },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  },

  findValidPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
      },
      include: {
        user: true,
      },
    });
  },

  markPasswordResetTokenAsUsed(tokenId: string) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  },

  createSession(userId: string, expiresAt: Date) {
    return prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });
  },

  async findSessionUser(sessionId: string, userId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    return session?.user ?? null;
  },

  deleteSession(sessionId: string) {
    return prisma.session.deleteMany({
      where: { id: sessionId },
    });
  },

  deleteSessionsByUserId(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  },
};
