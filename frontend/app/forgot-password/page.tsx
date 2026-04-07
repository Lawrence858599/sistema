import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <section className="section-block auth-section">
      <div className="container auth-card">
        <div>
          <p className="eyebrow">Recuperacao de senha</p>
          <h1>Gerar novo acesso</h1>
          <p>Informe o e-mail da conta para criar um link de redefinicao.</p>
        </div>
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
        <form action={requestPasswordResetAction} className="form-panel">
          <label>
            E-mail
            <input name="email" type="email" required />
          </label>
          <SubmitButton className="primary-button" label="Gerar link" pendingLabel="Gerando link..." />
        </form>
      </div>
    </section>
  );
}
