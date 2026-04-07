import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { deleteProductAction, saveProductAction } from "@/features/admin/actions";
import { adminService } from "@/services/admin-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const data = await adminService.getDashboardData();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="stack-list">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
      <form action={saveProductAction} className="panel form-panel">
        <h2>Novo produto</h2>
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
            Preco em centavos
            <input name="priceInCents" type="number" min="1" required />
          </label>
          <label>
            Estoque
            <input name="stock" type="number" min="0" required />
          </label>
          <label>
            Categoria
            <select name="categoryId" required>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            URL da imagem
            <input name="imageUrl" type="url" required />
          </label>
          <label className="form-grid__wide">
            Descricao
            <textarea name="description" rows={4} required />
          </label>
          <label className="checkbox-row">
            <input name="featured" type="checkbox" value="true" />
            Produto em destaque
          </label>
          <label className="checkbox-row">
            <input defaultChecked name="active" type="checkbox" value="true" />
            Produto ativo
          </label>
        </div>
        <SubmitButton className="primary-button" label="Salvar produto" pendingLabel="Salvando..." />
      </form>

      {data.products.map((product) => (
        <form action={saveProductAction} className="panel form-panel" key={product.id}>
          <input name="id" type="hidden" value={product.id} />
          <div className="panel-header">
            <div>
              <h2>{product.name}</h2>
              <p>{formatCurrency(product.priceInCents)}</p>
            </div>
            <div className="panel-actions">
              <button className="ghost-button" formAction={deleteProductAction} type="submit">
                Excluir
              </button>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Nome
              <input defaultValue={product.name} name="name" required />
            </label>
            <label>
              Slug
              <input defaultValue={product.slug} name="slug" />
            </label>
            <label>
              Preco em centavos
              <input defaultValue={product.priceInCents} name="priceInCents" type="number" min="1" required />
            </label>
            <label>
              Estoque
              <input defaultValue={product.stock} name="stock" type="number" min="0" required />
            </label>
            <label>
              Categoria
              <select defaultValue={product.categoryId} name="categoryId" required>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              URL da imagem
              <input defaultValue={product.imageUrl} name="imageUrl" type="url" required />
            </label>
            <label className="form-grid__wide">
              Descricao
              <textarea defaultValue={product.description} name="description" rows={4} required />
            </label>
            <label className="checkbox-row">
              <input defaultChecked={product.featured} name="featured" type="checkbox" value="true" />
              Produto em destaque
            </label>
            <label className="checkbox-row">
              <input defaultChecked={product.active} name="active" type="checkbox" value="true" />
              Produto ativo
            </label>
          </div>
          <SubmitButton className="secondary-button" label="Atualizar produto" pendingLabel="Atualizando..." />
        </form>
      ))}
    </div>
  );
}
