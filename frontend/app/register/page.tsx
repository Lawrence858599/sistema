import Link from "next/link";
import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { registerAction } from "@/features/auth/actions";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSingleSearchParam(resolvedSearchParams.next) ?? "/account";

  return (
    <section className="section-block auth-section">
      <div className="container auth-card">
        <div>
          <p className="eyebrow">Nova conta</p>
          <h1>Criar cadastro</h1>
          <p>Comece com nome, e-mail e senha. O restante do perfil pode ser ajustado depois.</p>
        </div>
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
        <form action={registerAction} className="form-panel">
          <input name="next" type="hidden" value={nextPath} />
          <label>
            Nome completo
            <input name="fullName" required />
          </label>
          <label>
            E-mail
            <input name="email" type="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" required />
          </label>
          <label>
            Confirmar senha
            <input name="confirmPassword" type="password" required />
          </label>
          <SubmitButton className="primary-button" label="Criar conta" pendingLabel="Criando conta..." />
        </form>
        <div className="auth-links">
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Ja tenho conta</Link>
        </div>
      </div>
    </section>
  );
}
