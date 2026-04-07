import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "@/services/auth-service";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { AppError } from "@/lib/errors";

function createUserRepositoryStub() {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    createPasswordResetToken: vi.fn(),
    findValidPasswordResetToken: vi.fn(),
    markPasswordResetTokenAsUsed: vi.fn(),
    createSession: vi.fn(),
    findSessionUser: vi.fn(),
    deleteSession: vi.fn(),
    deleteSessionsByUserId: vi.fn(),
  };
}

describe("authService", () => {
  it("registers a user with a hashed password", async () => {
    const users = createUserRepositoryStub();
    users.findByEmail.mockResolvedValue(null);
    users.createUser.mockImplementation(async (payload) => ({
      id: "user-1",
      fullName: payload.fullName,
      email: payload.email,
      phone: null,
      documentValue: null,
      passwordHash: payload.passwordHash,
      role: "CUSTOMER",
      address: null,
    }));

    const service = createAuthService({ users: users as never });
    const result = await service.register({
      fullName: "Maria da Silva",
      email: "maria@example.com",
      password: "Senha123",
      confirmPassword: "Senha123",
    });

    expect(result.email).toBe("maria@example.com");
    const storedUser = await users.createUser.mock.results[0].value;
    expect(storedUser.passwordHash).not.toBe("Senha123");
    await expect(verifyPassword("Senha123", storedUser.passwordHash)).resolves.toBe(true);
  });

  it("rejects login with invalid password", async () => {
    const users = createUserRepositoryStub();
    users.findByEmail.mockResolvedValue({
      id: "user-1",
      fullName: "Maria da Silva",
      email: "maria@example.com",
      phone: null,
      documentValue: null,
      passwordHash: await hashPassword("Senha123"),
      role: "CUSTOMER",
      address: null,
    });

    const service = createAuthService({ users: users as never });

    await expect(
      service.login({
        email: "maria@example.com",
        password: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
