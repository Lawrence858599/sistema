import type { OrderStatus } from "@/types/domain";
import { prisma } from "@/lib/prisma";

export const orderRepository = {
  listByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  listAll() {
    return prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },
};
