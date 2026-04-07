"use client";

import Link from "next/link";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import type { SessionUser } from "@/types/domain";

interface HeaderMenuProps {
  currentUser: SessionUser | null;
  cartCount: number;
  logoutAction: () => Promise<void>;
}

export function HeaderMenu({
  currentUser,
  cartCount,
  logoutAction,
}: HeaderMenuProps) {
  const mobileNav = useMobileNav();

  return (
    <div className="header-menu">
      <nav className="desktop-nav">
        <Link href="/products">Catalogo</Link>
        <Link href="/cart">Carrinho ({cartCount})</Link>
        {currentUser ? <Link href="/account">Minha conta</Link> : <Link href="/login">Entrar</Link>}
        {currentUser?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
        {currentUser ? (
          <form action={logoutAction}>
            <button className="ghost-button" type="submit">
              Sair
            </button>
          </form>
        ) : null}
      </nav>

      <button className="mobile-nav-toggle" onClick={mobileNav.toggle} type="button">
        Menu
      </button>

      {mobileNav.isOpen ? (
        <div className="mobile-nav-panel">
          <Link href="/products" onClick={mobileNav.close}>
            Catalogo
          </Link>
          <Link href="/cart" onClick={mobileNav.close}>
            Carrinho ({cartCount})
          </Link>
          {currentUser ? (
            <>
              <Link href="/account" onClick={mobileNav.close}>
                Minha conta
              </Link>
              {currentUser.role === "ADMIN" ? (
                <Link href="/admin" onClick={mobileNav.close}>
                  Admin
                </Link>
              ) : null}
              <form action={logoutAction}>
                <button className="ghost-button" type="submit">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" onClick={mobileNav.close}>
              Entrar
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
