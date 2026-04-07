import { AccountNav } from "@/components/account-nav";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser("/account");

  return (
    <section className="section-block">
      <div className="container page-heading">
        <div>
          <p className="eyebrow">Area do cliente</p>
          <h1>Perfil, seguranca, pedidos e checkout organizados em uma mesma jornada.</h1>
        </div>
      </div>
      <div className="container stack-layout">
        <AccountNav />
        {children}
      </div>
    </section>
  );
}
