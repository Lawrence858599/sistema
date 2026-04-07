import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/auth/schemas";

describe("validation", () => {
  it("rejects weak passwords during registration", () => {
    const result = registerSchema.safeParse({
      fullName: "Teste Usuario",
      email: "teste@example.com",
      password: "fraca",
      confirmPassword: "fraca",
    });

    expect(result.success).toBe(false);
  });
});
