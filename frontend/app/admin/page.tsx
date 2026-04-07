import Link from "next/link";
import { adminService } from "@/services/admin-service";
import { formatCurrency } from "@/utils/currency";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await adminService.getDashboardData();
  const recentOrders = data.orders.slice(0, 5);

  return (
    <div className="stack-list">
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Usuarios</span>
          <strong>{data.metrics.totalUsers}</strong>
        </article>
        <article className="metric-card">
          <span>Pedidos</span>
          <strong>{data.metrics.totalOrders}</strong>
        </article>
        <article className="metric-card">
          <span>Receita</span>
          <strong>{formatCurrency(data.metrics.totalRevenueInCents)}</strong>
        </article>
        <article className="metric-card">
          <span>Baixo estoque</span>
          <strong>{data.metrics.lowStockProducts}</strong>
        </article>
      </div>

      <div className="two-column-panels">
        <section className="panel">
          <h2>Acessos rapidos</h2>
          <div className="stack-list compact">
            <Link href="/admin/products">Gerenciar produtos</Link>
            <Link href="/admin/categories">Gerenciar categorias</Link>
            <Link href="/admin/orders">Acompanhar pedidos</Link>
            <Link href="/admin/users">Controlar usuarios</Link>
          </div>
        </section>
        <section className="panel">
          <h2>Ultimos pedidos</h2>
          <div className="stack-list compact">
            {recentOrders.map((order) => (
              <div className="summary-line" key={order.id}>
                <span>{order.orderNumber} - {order.user.fullName}</span>
                <strong>{order.status}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
