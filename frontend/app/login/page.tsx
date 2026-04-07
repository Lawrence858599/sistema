import Link from "next/link";
import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/features/auth/actions";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSingleSearchParam(resolvedSearchParams.next) ?? "/account";

  return (
    <section className="section-block auth-section">
      <div className="container auth-card">
        <div>
          <p className="eyebrow">Acesso seguro</p>
          <h1>Entrar na conta</h1>
          <p>Use seu e-mail e senha para acessar perfil, pedidos, carrinho e checkout.</p>
        </div>
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
        <form action={loginAction} className="form-panel">
          <input name="next" type="hidden" value={nextPath} />
          <label>
            E-mail
            <input name="email" type="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" required />
          </label>
          <SubmitButton className="primary-button" label="Entrar" pendingLabel="Entrando..." />
        </form>
        <div className="auth-links">
          <Link href="/forgot-password">Esqueci minha senha</Link>
          <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Criar conta</Link>
        </div>
      </div>
    </section>
  );
}
