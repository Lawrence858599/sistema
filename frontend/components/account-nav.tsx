import Link from "next/link";

export function AccountNav() {
  return (
    <nav className="subnav">
      <Link href="/account">Perfil</Link>
      <Link href="/account/orders">Pedidos</Link>
      <Link href="/cart">Carrinho</Link>
      <Link href="/checkout">Checkout</Link>
    </nav>
  );
}
