import { z } from "zod";
import { paymentMethodValues } from "@/types/domain";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome do destinatario."),
  phone: optionalText,
  documentValue: optionalText,
  recipientName: optionalText,
  line1: z.string().trim().min(5, "Informe o endereco completo."),
  line2: optionalText,
  district: optionalText,
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.string().trim().min(2, "Informe o estado."),
  postalCode: z.string().trim().min(8, "Informe o CEP."),
  country: optionalText,
  paymentMethod: z.enum(paymentMethodValues),
});
