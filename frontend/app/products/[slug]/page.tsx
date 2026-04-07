import Link from "next/link";
import { notFound } from "next/navigation";
import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { addToCartAction } from "@/features/cart/actions";
import { AppError } from "@/lib/errors";
import { catalogService } from "@/services/catalog-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const product = await catalogService.getProductDetail(resolvedParams.slug);

    return (
      <section className="section-block">
        <div className="container product-detail">
          <div className="product-detail__media">
            <img alt={product.name} src={product.imageUrl} />
          </div>
          <div className="product-detail__content">
            <p className="eyebrow">{product.categoryName}</p>
            <h1>{product.name}</h1>
            <FlashMessage
              message={getSingleSearchParam(resolvedSearchParams.error)}
              type="error"
            />
            <FlashMessage
              message={getSingleSearchParam(resolvedSearchParams.success)}
              type="success"
            />
            <p>{product.description}</p>
            <div className="product-detail__price">
              <strong>{formatCurrency(product.priceInCents)}</strong>
              <span>
                {product.stock > 0
                  ? `${product.stock} unidades disponiveis`
                  : "Produto temporariamente esgotado"}
              </span>
            </div>
            <form action={addToCartAction} className="product-detail__form">
              <input name="productId" type="hidden" value={product.id} />
              <label>
                Quantidade
                <input defaultValue="1" max={product.stock} min="1" name="quantity" type="number" />
              </label>
              <SubmitButton
                className="primary-button"
                label="Adicionar ao carrinho"
                pendingLabel="Adicionando..."
              />
            </form>
            <div className="product-detail__links">
              <Link className="secondary-button" href="/cart">
                Ver carrinho
              </Link>
              <Link href="/products">Continuar comprando</Link>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "PRODUCT_NOT_FOUND") {
      notFound();
    }

    throw error;
  }
}
