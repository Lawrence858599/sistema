import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <section className="section-block section-block--muted">
      <div className="container page-heading">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Controle produtos, categorias, usuarios e pedidos sem misturar regra com interface.</h1>
        </div>
      </div>
      <div className="container stack-layout">
        <AdminNav />
        {children}
      </div>
    </section>
  );
}
