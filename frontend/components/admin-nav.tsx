import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="subnav">
      <Link href="/admin">Resumo</Link>
      <Link href="/admin/products">Produtos</Link>
      <Link href="/admin/categories">Categorias</Link>
      <Link href="/admin/orders">Pedidos</Link>
      <Link href="/admin/users">Usuarios</Link>
    </nav>
  );
}
