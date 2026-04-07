import type { Prisma } from "@prisma/client";
import type { CatalogFilters } from "@/types/domain";
import { prisma } from "@/lib/prisma";

function getOrderBy(sort?: CatalogFilters["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceInCents: "asc" }];
    case "price-desc":
      return [{ priceInCents: "desc" }];
    case "name-asc":
      return [{ name: "asc" }];
    case "name-desc":
      return [{ name: "desc" }];
    case "relevance":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export const catalogRepository = {
  listCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  listFeaturedProducts(limit = 4) {
    return prisma.product.findMany({
      where: {
        active: true,
        featured: true,
      },
      include: { category: true },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });
  },

  listProducts(filters: CatalogFilters) {
    return prisma.product.findMany({
      where: {
        active: true,
        ...(filters.query
          ? {
              name: {
                contains: filters.query,
              },
            }
          : {}),
        ...(filters.categorySlug
          ? {
              category: {
                slug: filters.categorySlug,
              },
            }
          : {}),
        ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
          ? {
              priceInCents: {
                ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
                ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
              },
            }
          : {}),
      },
      include: { category: true },
      orderBy: getOrderBy(filters.sort),
    });
  },

  findProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  },

  findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });
  },

  listAdminProducts() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  },
};
