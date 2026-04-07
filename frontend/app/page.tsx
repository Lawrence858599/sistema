import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { catalogService } from "@/services/catalog-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await catalogService.getHomepageData();

  return (
    <div>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Novo jeito de comprar tecnologia e casa inteligente</p>
            <h1>Uma loja organizada para vender bem hoje e evoluir com seguranca amanha.</h1>
            <p>
              Homepage responsiva, busca clara, catalogo filtravel, checkout completo,
              conta do cliente e painel administrativo com uma arquitetura simples de manter.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/products">
                Explorar catalogo
              </Link>
              <Link className="secondary-button" href="/admin">
                Ver painel admin
              </Link>
            </div>
            <SearchBar />
          </div>
          <div className="hero-card">
            <div className="hero-card__badge">Colecao em destaque</div>
            <h2>Produtos pensados para casa, audio, workspace e bem-estar.</h2>
            <p>
              Estrutura modular, autenticacao segura, Prisma, Next.js App Router e
              seed com dados reais para acelerar a evolucao do projeto.
            </p>
            <ul>
              <li>Busca visivel em qualquer tela importante</li>
              <li>Carrinho persistente por usuario</li>
              <li>Checkout com resumo, pagamento simulado e historico de pedidos</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container section-header">
          <div>
            <p className="eyebrow">Categorias</p>
            <h2>Navegacao clara desde o primeiro acesso</h2>
          </div>
          <Link href="/products">Ver todos os produtos</Link>
        </div>
        <div className="container card-grid categories-grid">
          {data.categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--muted">
        <div className="container section-header">
          <div>
            <p className="eyebrow">Destaques</p>
            <h2>Produtos prontos para uma vitrine moderna e objetiva</h2>
          </div>
          <Link href="/products">Ir para o catalogo</Link>
        </div>
        <div className="container card-grid products-grid">
          {data.featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
