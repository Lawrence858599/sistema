import { EmptyState } from "@/components/empty-state";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth/session";
import { orderService } from "@/services/order-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const currentUser = await requireUser("/account/orders");
  const orders = await orderService.listUserOrders(currentUser.id);
  const resolvedSearchParams = await searchParams;

  if (orders.length === 0) {
    return (
      <div>
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
        <EmptyState
          actionHref="/products"
          actionLabel="Comprar agora"
          description="Assim que voce finalizar um pedido, ele aparecera aqui com status e itens."
          title="Nenhum pedido registrado"
        />
      </div>
    );
  }

  return (
    <div className="stack-list">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      {orders.map((order) => (
        <article className="panel order-card" key={order.id}>
          <div className="order-card__header">
            <div>
              <p className="eyebrow">Pedido {order.orderNumber}</p>
              <h2>{order.status}</h2>
            </div>
            <strong>{formatCurrency(order.totalInCents)}</strong>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.productName} x {item.quantity}
              </li>
            ))}
          </ul>
          <small>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</small>
        </article>
      ))}
    </div>
  );
}
