import Link from "next/link";
import { addToCartAction } from "@/features/cart/actions";
import { formatCurrency } from "@/utils/currency";
import type { CatalogProductCard } from "@/types/domain";
import { SubmitButton } from "@/components/submit-button";

interface ProductCardProps {
  product: CatalogProductCard;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link className="product-card__media" href={`/products/${product.slug}`}>
        <img alt={product.name} src={product.imageUrl} />
      </Link>
      <div className="product-card__content">
        <div className="product-card__header">
          <span>{product.categoryName}</span>
          {product.featured ? <strong>Destaque</strong> : null}
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="product-card__footer">
          <div>
            <strong>{formatCurrency(product.priceInCents)}</strong>
            <span>{product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}</span>
          </div>
          <form action={addToCartAction}>
            <input name="productId" type="hidden" value={product.id} />
            <input name="quantity" type="hidden" value="1" />
            <SubmitButton
              className="secondary-button"
              label="Adicionar"
              pendingLabel="Adicionando..."
            />
          </form>
        </div>
      </div>
    </article>
  );
}
