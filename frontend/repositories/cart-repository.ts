import { prisma } from "@/lib/prisma";

async function ensureCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export const cartRepository = {
  async getCartWithItems(userId: string) {
    await ensureCart(userId);

    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });
  },

  async setItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await ensureCart(userId);

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      });
      return;
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  },

  async removeItem(userId: string, productId: string) {
    const cart = await ensureCart(userId);

    return prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });
  },

  async clearCart(userId: string) {
    const cart = await ensureCart(userId);

    return prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
  },
};
