import { describe, expect, it, vi } from "vitest";
import { buildCartSummary, createCartService } from "@/services/cart-service";
import { AppError } from "@/lib/errors";

const mockCart = {
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

describe("cartService", () => {
  it("builds cart totals correctly", () => {
    const summary = buildCartSummary(mockCart as never);
    expect(summary.itemCount).toBe(2);
    expect(summary.subtotalInCents).toBe(35980);
  });

  it("prevents adding more items than available in stock", async () => {
    const service = createCartService({
      carts: {
        getCartWithItems: vi.fn().mockResolvedValue(mockCart),
        setItemQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      } as never,
      catalog: {
        findProductById: vi.fn().mockResolvedValue(mockCart.items[0].product),
      } as never,
    });

    await expect(
      service.addItem("user-1", { productId: "product-1", quantity: 5 }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
