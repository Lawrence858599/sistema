import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha precisa ter ao menos uma letra maiuscula.")
  .regex(/[0-9]/, "A senha precisa ter ao menos um numero.");

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().trim().email("Informe um e-mail valido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a sua senha."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "A confirmacao de senha nao confere.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Token invalido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "A confirmacao de senha nao confere.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "A confirmacao de senha nao confere.",
    path: ["confirmPassword"],
  });

export const profileSchema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().trim().email("Informe um e-mail valido."),
    phone: optionalText,
    documentValue: optionalText,
    recipientName: optionalText,
    line1: optionalText,
    line2: optionalText,
    district: optionalText,
    city: optionalText,
    state: optionalText,
    postalCode: optionalText,
    country: optionalText,
  })
  .superRefine((value, ctx) => {
    const hasAnyAddressField = [
      value.recipientName,
      value.line1,
      value.line2,
      value.district,
      value.city,
      value.state,
      value.postalCode,
      value.country,
    ].some(Boolean);

    const hasCoreAddress =
      Boolean(value.line1) &&
      Boolean(value.city) &&
      Boolean(value.state) &&
      Boolean(value.postalCode);

    if (hasAnyAddressField && !hasCoreAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Preencha endereco, cidade, estado e CEP para salvar o endereco completo.",
        path: ["line1"],
      });
    }
  });
