import { describe, expect, it } from "vitest";
import { prepareOrderDraft } from "@/services/order-service";
import { AppError } from "@/lib/errors";

const user = {
  id: "user-1",
  fullName: "Maria da Silva",
  email: "maria@example.com",
  phone: "11999999999",
  documentValue: "12345678900",
  passwordHash: "hash",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
  address: null,
};

const cart = {
  id: "cart-1",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: "item-1",
      cartId: "cart-1",
      productId: "product-1",
      quantity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: "product-1",
        name: "Lampada Aurora Wi-Fi",
        slug: "lampada-aurora-wifi",
        description: "Lampada",
        priceInCents: 17990,
        stock: 5,
        featured: true,
        active: true,
        imageUrl: "https://example.com/lampada.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: "cat-1",
        category: {
          id: "cat-1",
          name: "Casa Inteligente",
          slug: "casa-inteligente",
          description: "Categoria",
          imageUrl: "https://example.com/categoria.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  ],
};

describe("orderService", () => {
  it("creates a consistent order draft from cart and checkout data", () => {
    const draft = prepareOrderDraft({
      user: user as never,
      cart: cart as never,
      checkout: {
        fullName: "Maria da Silva",
        phone: "11999999999",
        documentValue: "12345678900",
        recipientName: "Maria da Silva",
        line1: "Rua das Flores, 100",
        line2: "Apto 12",
        district: "Centro",
        city: "Sao Paulo",
        state: "SP",
        postalCode: "01001000",
        country: "Brasil",
        paymentMethod: "PIX",
      },
      now: new Date("2026-04-06T12:00:00.000Z"),
    });

    expect(draft.totalInCents).toBe(35980);
    expect(draft.items).toHaveLength(1);
    expect(draft.orderNumber).toContain("LUME-");
  });

  it("rejects order creation when cart is empty", () => {
    expect(() =>
      prepareOrderDraft({
        user: user as never,
        cart: { ...cart, items: [] } as never,
        checkout: {
          fullName: "Maria da Silva",
          phone: "11999999999",
          documentValue: "12345678900",
          recipientName: "Maria da Silva",
          line1: "Rua das Flores, 100",
          line2: "Apto 12",
          district: "Centro",
          city: "Sao Paulo",
          state: "SP",
          postalCode: "01001000",
          country: "Brasil",
          paymentMethod: "PIX",
        },
      }),
    ).toThrow(AppError);
  });
});
