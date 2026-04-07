import type { CategoryFormInput, ProductFormInput } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import { normalizeOptionalString } from "@/utils/strings";

export const adminRepository = {
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

  saveCategory(input: CategoryFormInput) {
    const payload = {
      name: input.name.trim(),
      slug: input.slug?.trim() ?? input.name.trim(),
      description: input.description.trim(),
      imageUrl: input.imageUrl.trim(),
    };

    if (input.id) {
      return prisma.category.update({
        where: { id: input.id },
        data: payload,
      });
    }

    return prisma.category.create({
      data: payload,
    });
  },

  countProductsByCategory(categoryId: string) {
    return prisma.product.count({
      where: { categoryId },
    });
  },

  deleteCategory(categoryId: string) {
    return prisma.category.delete({
      where: { id: categoryId },
    });
  },

  saveProduct(input: ProductFormInput) {
    const payload = {
      name: input.name.trim(),
      slug: input.slug?.trim() ?? input.name.trim(),
      description: input.description.trim(),
      priceInCents: input.priceInCents,
      stock: input.stock,
      featured: input.featured,
      active: input.active,
      imageUrl: input.imageUrl.trim(),
      categoryId: input.categoryId,
    };

    if (input.id) {
      return prisma.product.update({
        where: { id: input.id },
        data: payload,
      });
    }

    return prisma.product.create({
      data: payload,
    });
  },

  async deleteProduct(productId: string) {
    await prisma.cartItem.deleteMany({
      where: { productId },
    });

    return prisma.product.delete({
      where: { id: productId },
    });
  },

  listUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
  },

  updateUserRole(userId: string, role: "CUSTOMER" | "ADMIN") {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },

  async getDashboardMetrics() {
    const [totalUsers, totalOrders, revenueAggregate, lowStockProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalInCents: true },
      }),
      prisma.product.count({
        where: {
          active: true,
          stock: { lte: 5 },
        },
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenueInCents: revenueAggregate._sum.totalInCents ?? 0,
      lowStockProducts,
    };
  },
};
