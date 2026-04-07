import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { FlashMessage } from "@/components/flash-message";
import { removeCartItemAction, updateCartItemAction } from "@/features/cart/actions";
import { requireUser } from "@/lib/auth/session";
import { cartService } from "@/services/cart-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type CartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const currentUser = await requireUser("/cart");
  const resolvedSearchParams = await searchParams;
  const cart = await cartService.getSummary(currentUser.id);

  return (
    <section className="section-block">
      <div className="container page-heading">
        <div>
          <p className="eyebrow">Carrinho</p>
          <h1>Revise quantidades, subtotal e total antes do checkout.</h1>
        </div>
        <div>
          <FlashMessage
            message={getSingleSearchParam(resolvedSearchParams.success)}
            type="success"
          />
          <FlashMessage
            message={getSingleSearchParam(resolvedSearchParams.error)}
            type="error"
          />
        </div>
      </div>

      <div className="container cart-layout">
        <div>
          {cart.items.length === 0 ? (
            <EmptyState
              actionHref="/products"
              actionLabel="Ver catalogo"
              description="Adicione produtos para calcular subtotal, frete simulado e finalizar o pedido."
              title="Seu carrinho esta vazio"
            />
          ) : (
            <div className="stack-list">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.productId}>
                  <img alt={item.name} src={item.imageUrl} />
                  <div className="cart-item__content">
                    <div>
                      <h2>{item.name}</h2>
                      <p>{item.categoryName}</p>
                    </div>
                    <div className="cart-item__controls">
                      <form action={updateCartItemAction}>
                        <input name="productId" type="hidden" value={item.productId} />
                        <input
                          name="quantity"
                          type="hidden"
                          value={Math.max(item.quantity - 1, 0)}
                        />
                        <button type="submit">-</button>
                      </form>
                      <span>{item.quantity}</span>
                      <form action={updateCartItemAction}>
                        <input name="productId" type="hidden" value={item.productId} />
                        <input
                          name="quantity"
                          type="hidden"
                          value={Math.min(item.quantity + 1, item.stock)}
                        />
                        <button type="submit">+</button>
                      </form>
                    </div>
                  </div>
                  <div className="cart-item__meta">
                    <strong>{formatCurrency(item.totalInCents)}</strong>
                    <form action={removeCartItemAction}>
                      <input name="productId" type="hidden" value={item.productId} />
                      <button className="ghost-button" type="submit">
                        Remover
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="summary-card">
          <p className="eyebrow">Resumo</p>
          <h2>Total do pedido</h2>
          <div className="summary-row">
            <span>Itens</span>
            <strong>{cart.itemCount}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(cart.subtotalInCents)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(cart.totalInCents)}</strong>
          </div>
          <Link className="primary-button" href="/checkout">
            Ir para checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
