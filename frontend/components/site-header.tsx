import Link from "next/link";
import type { SessionUser } from "@/types/domain";
import { appConfig } from "@/lib/env";
import { logoutAction } from "@/features/auth/actions";
import { HeaderMenu } from "@/components/header-menu";
import { SearchBar } from "@/components/search-bar";

interface SiteHeaderProps {
  currentUser: SessionUser | null;
  cartCount: number;
}

export function SiteHeader({ currentUser, cartCount }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" href="/">
          <span>L</span>
          <div>
            <strong>{appConfig.storeName}</strong>
            <small>E-commerce modular com Next.js</small>
          </div>
        </Link>
        <div className="site-header__search">
          <SearchBar compact />
        </div>
        <HeaderMenu
          cartCount={cartCount}
          currentUser={currentUser}
          logoutAction={logoutAction}
        />
      </div>
    </header>
  );
}
