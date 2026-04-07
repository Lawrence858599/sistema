import { AppError } from "@/lib/errors";
import { appConfig } from "@/lib/env";
import {
  createRawToken,
  createTokenHash,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/passwords";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import { userRepository } from "@/repositories/user-repository";
import type { Role, SessionUser } from "@/types/domain";
import { normalizeEmail } from "@/utils/strings";

interface AuthDependencies {
  users: typeof userRepository;
  now: () => Date;
}

function mapSessionUser(user: Awaited<ReturnType<typeof userRepository.findById>>): SessionUser {
  if (!user) {
    throw new AppError("Usuario nao encontrado.");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as Role,
  };
}

export function createAuthService(partialDependencies?: Partial<AuthDependencies>) {
  const dependencies: AuthDependencies = {
    users: partialDependencies?.users ?? userRepository,
    now: partialDependencies?.now ?? (() => new Date()),
  };

  return {
    async register(input: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) {
      const payload = registerSchema.parse(input);
      const email = normalizeEmail(payload.email);
      const existingUser = await dependencies.users.findByEmail(email);

      if (existingUser) {
        throw new AppError("Ja existe uma conta com esse e-mail.");
      }

      const passwordHash = await hashPassword(payload.password);
      const user = await dependencies.users.createUser({
        fullName: payload.fullName.trim(),
        email,
        passwordHash,
      });

      return mapSessionUser(user);
    },

    async login(input: { email: string; password: string }) {
      const payload = loginSchema.parse(input);
      const user = await dependencies.users.findByEmail(normalizeEmail(payload.email));

      if (!user) {
        throw new AppError("E-mail ou senha invalidos.");
      }

      const passwordMatches = await verifyPassword(payload.password, user.passwordHash);
      if (!passwordMatches) {
        throw new AppError("E-mail ou senha invalidos.");
      }

      return mapSessionUser(user);
    },

    async requestPasswordReset(input: { email: string }) {
      const payload = forgotPasswordSchema.parse(input);
      const user = await dependencies.users.findByEmail(normalizeEmail(payload.email));

      if (!user) {
        return null;
      }

      const rawToken = createRawToken();
      const expiresAt = new Date(dependencies.now().getTime());
      expiresAt.setMinutes(
        expiresAt.getMinutes() + appConfig.passwordResetWindowInMinutes,
      );

      await dependencies.users.createPasswordResetToken(
        user.id,
        createTokenHash(rawToken),
        expiresAt,
      );

      return rawToken;
    },

    async resetPassword(input: {
      token: string;
      password: string;
      confirmPassword: string;
    }) {
      const payload = resetPasswordSchema.parse(input);
      const tokenRecord = await dependencies.users.findValidPasswordResetToken(
        createTokenHash(payload.token),
      );

      if (!tokenRecord || tokenRecord.expiresAt <= dependencies.now()) {
        throw new AppError("O link de redefinicao esta invalido ou expirou.");
      }

      const passwordHash = await hashPassword(payload.password);
      await dependencies.users.updatePassword(tokenRecord.userId, passwordHash);
      await dependencies.users.markPasswordResetTokenAsUsed(tokenRecord.id);
      await dependencies.users.deleteSessionsByUserId(tokenRecord.userId);
    },

    async getProfile(userId: string) {
      const user = await dependencies.users.findById(userId);

      if (!user) {
        throw new AppError("Usuario nao encontrado.");
      }

      return user;
    },

    async updateProfile(userId: string, input: Record<string, string | undefined>) {
      const currentUser = await dependencies.users.findById(userId);
      if (!currentUser) {
        throw new AppError("Usuario nao encontrado.");
      }

      const payload = profileSchema.parse(input);
      const normalizedEmail = normalizeEmail(payload.email);

      if (normalizedEmail !== currentUser.email) {
        const existingUser = await dependencies.users.findByEmail(normalizedEmail);
        if (existingUser && existingUser.id !== userId) {
          throw new AppError("Esse e-mail ja esta sendo usado por outra conta.");
        }
      }

      return dependencies.users.updateProfile(userId, {
        ...payload,
        email: normalizedEmail,
      });
    },

    async changePassword(
      userId: string,
      input: { currentPassword: string; password: string; confirmPassword: string },
    ) {
      const payload = changePasswordSchema.parse(input);
      const currentUser = await dependencies.users.findById(userId);

      if (!currentUser) {
        throw new AppError("Usuario nao encontrado.");
      }

      const passwordMatches = await verifyPassword(
        payload.currentPassword,
        currentUser.passwordHash,
      );

      if (!passwordMatches) {
        throw new AppError("A senha atual nao confere.");
      }

      const passwordHash = await hashPassword(payload.password);
      await dependencies.users.updatePassword(userId, passwordHash);
    },
  };
}

export const authService = createAuthService();
