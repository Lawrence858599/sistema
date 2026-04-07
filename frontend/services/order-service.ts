import { checkoutSchema } from "@/features/checkout/schemas";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { cartRepository } from "@/repositories/cart-repository";
import { orderRepository } from "@/repositories/order-repository";
import { userRepository } from "@/repositories/user-repository";
import type { CheckoutInput } from "@/types/domain";
import { createOrderNumber } from "@/utils/orders";
import { normalizeOptionalString } from "@/utils/strings";

function sumTotals(items: { quantity: number; unitPriceInCents: number }[]) {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPriceInCents,
    0,
  );
}

export function prepareOrderDraft(input: {
  user: Awaited<ReturnType<typeof userRepository.findById>>;
  cart: Awaited<ReturnType<typeof cartRepository.getCartWithItems>> | null;
  checkout: CheckoutInput;
  now?: Date;
}) {
  const payload = checkoutSchema.parse(input.checkout);
  const user = input.user;
  const cart = input.cart;

  if (!user) {
    throw new AppError("Usuario nao encontrado.");
  }

  if (!cart || cart.items.length === 0) {
    throw new AppError("Seu carrinho esta vazio.");
  }

  const orderItems = cart.items.map((item) => {
    if (!item.product.active) {
      throw new AppError(`O produto ${item.product.name} esta indisponivel.`);
    }

    if (item.quantity > item.product.stock) {
      throw new AppError(
        `O produto ${item.product.name} nao possui estoque suficiente.`,
      );
    }

    return {
      productId: item.product.id,
      productName: item.product.name,
      imageUrl: item.product.imageUrl,
      unitPriceInCents: item.product.priceInCents,
      quantity: item.quantity,
    };
  });

  const subtotalInCents = sumTotals(orderItems);

  return {
    orderNumber: createOrderNumber(input.now),
    paymentMethod: payload.paymentMethod,
    shippingName: payload.fullName.trim(),
    shippingPhone: normalizeOptionalString(payload.phone),
    shippingDocument: normalizeOptionalString(payload.documentValue),
    shippingLine1: payload.line1.trim(),
    shippingLine2: normalizeOptionalString(payload.line2),
    shippingDistrict: normalizeOptionalString(payload.district),
    shippingCity: payload.city.trim(),
    shippingState: payload.state.trim(),
    shippingPostalCode: payload.postalCode.trim(),
    shippingCountry: normalizeOptionalString(payload.country) ?? "Brasil",
    subtotalInCents,
    totalInCents: subtotalInCents,
    items: orderItems,
    userProfileUpdate: {
      fullName: payload.fullName.trim(),
      phone: normalizeOptionalString(payload.phone),
      documentValue: normalizeOptionalString(payload.documentValue),
      address: {
        recipientName: normalizeOptionalString(payload.recipientName) ?? payload.fullName.trim(),
        line1: payload.line1.trim(),
        line2: normalizeOptionalString(payload.line2),
        district: normalizeOptionalString(payload.district),
        city: payload.city.trim(),
        state: payload.state.trim(),
        postalCode: payload.postalCode.trim(),
        country: normalizeOptionalString(payload.country) ?? "Brasil",
      },
    },
  };
}

export const orderService = {
  async getCheckoutData(userId: string) {
    const [user, cart] = await Promise.all([
      userRepository.findById(userId),
      cartRepository.getCartWithItems(userId),
    ]);

    if (!user) {
      throw new AppError("Usuario nao encontrado.");
    }

    return {
      user,
      cart,
    };
  },

  async placeOrder(userId: string, input: CheckoutInput) {
    const [user, cart] = await Promise.all([
      userRepository.findById(userId),
      cartRepository.getCartWithItems(userId),
    ]);

    const draft = prepareOrderDraft({
      user,
      cart,
      checkout: input,
      now: new Date(),
    });

    return prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: {
          id: {
            in: draft.items.map((item) => item.productId),
          },
        },
      });

      for (const draftItem of draft.items) {
        const product = products.find((item) => item.id === draftItem.productId);
        if (!product || !product.active || product.stock < draftItem.quantity) {
          throw new AppError(
            `O estoque do produto ${draftItem.productName} mudou. Atualize seu carrinho.`,
          );
        }
      }

      await transaction.user.update({
        where: { id: userId },
        data: {
          fullName: draft.userProfileUpdate.fullName,
          phone: draft.userProfileUpdate.phone,
          documentValue: draft.userProfileUpdate.documentValue,
          address: {
            upsert: {
              create: draft.userProfileUpdate.address,
              update: draft.userProfileUpdate.address,
            },
          },
        },
      });

      const order = await transaction.order.create({
        data: {
          orderNumber: draft.orderNumber,
          userId,
          paymentMethod: draft.paymentMethod,
          shippingName: draft.shippingName,
          shippingPhone: draft.shippingPhone,
          shippingDocument: draft.shippingDocument,
          shippingLine1: draft.shippingLine1,
          shippingLine2: draft.shippingLine2,
          shippingDistrict: draft.shippingDistrict,
          shippingCity: draft.shippingCity,
          shippingState: draft.shippingState,
          shippingPostalCode: draft.shippingPostalCode,
          shippingCountry: draft.shippingCountry,
          subtotalInCents: draft.subtotalInCents,
          totalInCents: draft.totalInCents,
          items: {
            create: draft.items,
          },
        },
        include: {
          items: true,
        },
      });

      for (const draftItem of draft.items) {
        await transaction.product.update({
          where: { id: draftItem.productId },
          data: {
            stock: {
              decrement: draftItem.quantity,
            },
          },
        });
      }

      const cartRecord = await transaction.cart.findUnique({
        where: { userId },
      });

      if (cartRecord) {
        await transaction.cartItem.deleteMany({
          where: { cartId: cartRecord.id },
        });
      }

      return order;
    });
  },

  listUserOrders(userId: string) {
    return orderRepository.listByUserId(userId);
  },

  listAllOrders() {
    return orderRepository.listAll();
  },

  updateOrderStatus(orderId: string, status: Parameters<typeof orderRepository.updateStatus>[1]) {
    return orderRepository.updateStatus(orderId, status);
  },
};
