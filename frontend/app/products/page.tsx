import { EmptyState } from "@/components/empty-state";
import { FlashMessage } from "@/components/flash-message";
import { ProductCard } from "@/components/product-card";
import { catalogService } from "@/services/catalog-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    query: getSingleSearchParam(resolvedSearchParams.query),
    categorySlug: getSingleSearchParam(resolvedSearchParams.categorySlug),
    minPrice: getSingleSearchParam(resolvedSearchParams.minPrice),
    maxPrice: getSingleSearchParam(resolvedSearchParams.maxPrice),
    sort: getSingleSearchParam(resolvedSearchParams.sort),
  };

  const data = await catalogService.getCatalogPageData(filters);

  return (
    <section className="section-block">
      <div className="container page-heading">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Encontre produtos com busca, filtros e ordenacao.</h1>
        </div>
        <FlashMessage
          message={getSingleSearchParam(resolvedSearchParams.error)}
          type="error"
        />
      </div>

      <div className="container catalog-layout">
        <aside className="filter-panel">
          <h2>Filtros</h2>
          <form className="filter-form">
            <label>
              Busca
              <input defaultValue={data.filters.query} name="query" placeholder="Nome do produto" />
            </label>
            <label>
              Categoria
              <select defaultValue={data.filters.categorySlug} name="categorySlug">
                <option value="">Todas</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preco minimo (centavos)
              <input defaultValue={data.filters.minPrice} min="0" name="minPrice" type="number" />
            </label>
            <label>
              Preco maximo (centavos)
              <input defaultValue={data.filters.maxPrice} min="0" name="maxPrice" type="number" />
            </label>
            <label>
              Ordenacao
              <select defaultValue={data.filters.sort ?? "relevance"} name="sort">
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Menor preco</option>
                <option value="price-desc">Maior preco</option>
                <option value="name-asc">Nome A-Z</option>
                <option value="name-desc">Nome Z-A</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              Aplicar filtros
            </button>
          </form>
          <div className="filter-panel__hint">
            <strong>Faixas rapidas</strong>
            <p>
              Dica: 20000 = {formatCurrency(20000)} e 90000 = {formatCurrency(90000)}.
            </p>
          </div>
        </aside>

        <div className="catalog-results">
          {data.products.length === 0 ? (
            <EmptyState
              actionHref="/products"
              actionLabel="Limpar filtros"
              description="Ajuste busca, categoria ou faixa de preco para encontrar outros itens."
              title="Nenhum produto encontrado"
            />
          ) : (
            <div className="card-grid products-grid">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
