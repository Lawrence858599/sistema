import { z } from "zod";

const sortableValues = [
  "relevance",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
] as const;

export const catalogFiltersSchema = z.object({
  query: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(sortableValues).optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Produto invalido."),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  productId: z.string().min(1, "Produto invalido."),
  quantity: z.coerce.number().int().min(0).max(99),
});
