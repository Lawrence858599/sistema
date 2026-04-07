import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { deleteCategoryAction, saveCategoryAction } from "@/features/admin/actions";
import { adminService } from "@/services/admin-service";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const data = await adminService.getDashboardData();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="stack-list">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
      <form action={saveCategoryAction} className="panel form-panel">
        <h2>Nova categoria</h2>
        <div className="form-grid">
          <label>
            Nome
            <input name="name" required />
          </label>
          <label>
            Slug
            <input name="slug" placeholder="Opcional" />
          </label>
          <label>
            URL da imagem
            <input name="imageUrl" type="url" required />
          </label>
          <label className="form-grid__wide">
            Descricao
            <textarea name="description" rows={4} required />
          </label>
        </div>
        <SubmitButton className="primary-button" label="Salvar categoria" pendingLabel="Salvando..." />
      </form>

      {data.categories.map((category) => (
        <form action={saveCategoryAction} className="panel form-panel" key={category.id}>
          <input name="id" type="hidden" value={category.id} />
          <div className="panel-header">
            <div>
              <h2>{category.name}</h2>
              <p>{category._count.products} produtos vinculados</p>
            </div>
            <div className="panel-actions">
              <button className="ghost-button" formAction={deleteCategoryAction} type="submit">
                Excluir
              </button>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Nome
              <input defaultValue={category.name} name="name" required />
            </label>
            <label>
              Slug
              <input defaultValue={category.slug} name="slug" />
            </label>
            <label>
              URL da imagem
              <input defaultValue={category.imageUrl} name="imageUrl" type="url" required />
            </label>
            <label className="form-grid__wide">
              Descricao
              <textarea defaultValue={category.description} name="description" rows={4} required />
            </label>
          </div>
          <SubmitButton className="secondary-button" label="Atualizar categoria" pendingLabel="Atualizando..." />
        </form>
      ))}
    </div>
  );
}
