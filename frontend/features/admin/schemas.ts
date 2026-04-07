import { z } from "zod";
import { orderStatusValues, roleValues } from "@/types/domain";

export const categoryFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(10, "Descreva melhor a categoria."),
  imageUrl: z.string().trim().url("Informe uma URL valida para a imagem."),
});

export const productFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(3, "Informe o nome do produto."),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(20, "Descreva melhor o produto."),
  priceInCents: z.coerce.number().int().positive("Informe um preco valido."),
  stock: z.coerce.number().int().nonnegative("Estoque nao pode ser negativo."),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
  imageUrl: z.string().trim().url("Informe uma URL valida para a imagem."),
  categoryId: z.string().trim().min(1, "Selecione uma categoria."),
});

export const roleUpdateSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(roleValues),
});

export const orderStatusSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum(orderStatusValues),
});
