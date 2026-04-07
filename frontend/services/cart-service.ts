import { AppError } from "@/lib/errors";
import { addToCartSchema, updateCartItemSchema } from "@/features/catalog/schemas";
import { cartRepository } from "@/repositories/cart-repository";
import { catalogRepository } from "@/repositories/catalog-repository";
import type { CartSummary } from "@/types/domain";

interface CartDependencies {
  carts: typeof cartRepository;
  catalog: typeof catalogRepository;
}

export function buildCartSummary(
  cart: Awaited<ReturnType<typeof cartRepository.getCartWithItems>> | null,
): CartSummary {
  const items = (cart?.items ?? []).map((item) => ({
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    imageUrl: item.product.imageUrl,
    categoryName: item.product.category.name,
    quantity: item.quantity,
    stock: item.product.stock,
    unitPriceInCents: item.product.priceInCents,
    totalInCents: item.quantity * item.product.priceInCents,
  }));

  const subtotalInCents = items.reduce(
    (total, item) => total + item.totalInCents,
    0,
  );

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalInCents,
    totalInCents: subtotalInCents,
  };
}

export function createCartService(partialDependencies?: Partial<CartDependencies>) {
  const dependencies: CartDependencies = {
    carts: partialDependencies?.carts ?? cartRepository,
    catalog: partialDependencies?.catalog ?? catalogRepository,
  };

  return {
    async getSummary(userId: string) {
      const cart = await dependencies.carts.getCartWithItems(userId);
      return buildCartSummary(cart);
    },

    async addItem(userId: string, input: { productId: string; quantity: number }) {
      const payload = addToCartSchema.parse(input);
      const product = await dependencies.catalog.findProductById(payload.productId);

      if (!product || !product.active) {
        throw new AppError("Produto indisponivel no momento.");
      }

      const cart = await dependencies.carts.getCartWithItems(userId);
      const currentQuantity =
        cart?.items.find((item) => item.productId === payload.productId)?.quantity ?? 0;
      const nextQuantity = currentQuantity + payload.quantity;

      if (nextQuantity > product.stock) {
        throw new AppError("Quantidade acima do estoque disponivel.");
      }

      await dependencies.carts.setItemQuantity(userId, payload.productId, nextQuantity);
      return this.getSummary(userId);
    },

    async updateQuantity(
      userId: string,
      input: { productId: string; quantity: number },
    ) {
      const payload = updateCartItemSchema.parse(input);
      const product = await dependencies.catalog.findProductById(payload.productId);

      if (!product || !product.active) {
        throw new AppError("Produto indisponivel no momento.");
      }

      if (payload.quantity > product.stock) {
        throw new AppError("Quantidade acima do estoque disponivel.");
      }

      await dependencies.carts.setItemQuantity(userId, payload.productId, payload.quantity);
      return this.getSummary(userId);
    },

    async removeItem(userId: string, productId: string) {
      await dependencies.carts.removeItem(userId, productId);
      return this.getSummary(userId);
    },
  };
}

export const cartService = createCartService();
