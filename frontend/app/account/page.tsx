import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { appConfig } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { changePasswordAction, updateProfileAction } from "@/features/auth/actions";
import { authService } from "@/services/auth-service";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const currentUser = await requireUser("/account");
  const profile = await authService.getProfile(currentUser.id);
  const resolvedSearchParams = await searchParams;

  return (
    <div className="stack-layout stack-layout--dense">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
      <div className="two-column-panels">
        <form action={updateProfileAction} className="panel form-panel">
          <h2>Dados pessoais</h2>
          <div className="form-grid">
            <label>
              Nome completo
              <input defaultValue={profile.fullName} name="fullName" required />
            </label>
            <label>
              E-mail
              <input defaultValue={profile.email} name="email" type="email" required />
            </label>
            <label>
              Telefone
              <input defaultValue={profile.phone ?? ""} name="phone" />
            </label>
            <label>
              {appConfig.customerDocumentLabel}
              <input defaultValue={profile.documentValue ?? ""} name="documentValue" />
            </label>
            <label>
              Destinatario
              <input defaultValue={profile.address?.recipientName ?? profile.fullName} name="recipientName" />
            </label>
            <label className="form-grid__wide">
              Endereco
              <input defaultValue={profile.address?.line1 ?? ""} name="line1" />
            </label>
            <label>
              Complemento
              <input defaultValue={profile.address?.line2 ?? ""} name="line2" />
            </label>
            <label>
              Bairro
              <input defaultValue={profile.address?.district ?? ""} name="district" />
            </label>
            <label>
              Cidade
              <input defaultValue={profile.address?.city ?? ""} name="city" />
            </label>
            <label>
              Estado
              <input defaultValue={profile.address?.state ?? ""} name="state" />
            </label>
            <label>
              CEP
              <input defaultValue={profile.address?.postalCode ?? ""} name="postalCode" />
            </label>
            <label>
              Pais
              <input defaultValue={profile.address?.country ?? "Brasil"} name="country" />
            </label>
          </div>
          <SubmitButton className="primary-button" label="Salvar perfil" pendingLabel="Salvando perfil..." />
        </form>

        <form action={changePasswordAction} className="panel form-panel">
          <h2>Seguranca</h2>
          <label>
            Senha atual
            <input name="currentPassword" type="password" required />
          </label>
          <label>
            Nova senha
            <input name="password" type="password" required />
          </label>
          <label>
            Confirmar nova senha
            <input name="confirmPassword" type="password" required />
          </label>
          <SubmitButton className="secondary-button" label="Alterar senha" pendingLabel="Atualizando..." />
        </form>
      </div>
    </div>
  );
}
