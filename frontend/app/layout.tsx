import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { appConfig } from "@/lib/env";
import { cartService } from "@/services/cart-service";

export const metadata: Metadata = {
  title: {
    default: appConfig.storeName,
    template: `%s | ${appConfig.storeName}`,
  },
  description:
    "E-commerce moderno com Next.js, Prisma e arquitetura modular simples para crescer sem virar bagunca.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const cartSummary = currentUser
    ? await cartService.getSummary(currentUser.id)
    : { itemCount: 0 };

  return (
    <html lang="pt-BR">
      <body>
        <div className="page-shell">
          <SiteHeader
            cartCount={cartSummary.itemCount}
            currentUser={currentUser}
          />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
