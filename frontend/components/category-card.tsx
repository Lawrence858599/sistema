import Link from "next/link";
import type { CatalogCategory } from "@/types/domain";

interface CategoryCardProps {
  category: CatalogCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link className="category-card" href={`/products?categorySlug=${category.slug}`}>
      <div
        aria-hidden="true"
        className="category-card__visual"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(18, 28, 45, 0.12), rgba(255, 255, 255, 0.15)), url(${category.imageUrl})` }}
      />
      <div className="category-card__content">
        <p className="eyebrow">Categoria</p>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <span>{category.productCount ?? 0} itens</span>
      </div>
    </Link>
  );
}
