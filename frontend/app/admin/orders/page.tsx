import { FlashMessage } from "@/components/flash-message";
import { updateOrderStatusAction } from "@/features/admin/actions";
import { adminService } from "@/services/admin-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const data = await adminService.getDashboardData();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="stack-list">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
      {data.orders.map((order) => (
        <article className="panel order-card" key={order.id}>
          <div className="order-card__header">
            <div>
              <p className="eyebrow">{order.orderNumber}</p>
              <h2>{order.user.fullName}</h2>
              <small>{order.user.email}</small>
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
          <form action={updateOrderStatusAction} className="inline-form">
            <input name="orderId" type="hidden" value={order.id} />
            <select defaultValue={order.status} name="status">
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PROCESSING">Em preparo</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <button className="secondary-button" type="submit">
              Atualizar status
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}
