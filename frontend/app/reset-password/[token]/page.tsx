import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { resetPasswordAction } from "@/features/auth/actions";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <section className="section-block auth-section">
      <div className="container auth-card">
        <div>
          <p className="eyebrow">Nova senha</p>
          <h1>Defina uma senha segura</h1>
          <p>Use pelo menos 8 caracteres com letra maiuscula e numero.</p>
        </div>
        {getSingleSearchParam(resolvedSearchParams.preview) ? (
          <FlashMessage
            message="Modo de desenvolvimento: este link foi gerado internamente pelo sistema."
            type="success"
          />
        ) : null}
        <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
        <form action={resetPasswordAction} className="form-panel">
          <input name="token" type="hidden" value={resolvedParams.token} />
          <label>
            Nova senha
            <input name="password" type="password" required />
          </label>
          <label>
            Confirmar nova senha
            <input name="confirmPassword" type="password" required />
          </label>
          <SubmitButton className="primary-button" label="Atualizar senha" pendingLabel="Atualizando..." />
        </form>
      </div>
    </section>
  );
}
