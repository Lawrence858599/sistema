import { AppError } from "@/lib/errors";
import { catalogFiltersSchema } from "@/features/catalog/schemas";
import { catalogRepository } from "@/repositories/catalog-repository";

export const catalogService = {
  async getHomepageData() {
    const [categories, featuredProducts] = await Promise.all([
      catalogRepository.listCategories(),
      catalogRepository.listFeaturedProducts(4),
    ]);

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        productCount: category._count.products,
      })),
      featuredProducts: featuredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        featured: product.featured,
        imageUrl: product.imageUrl,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
      })),
    };
  },

  async getCatalogPageData(rawFilters: Record<string, string | number | undefined>) {
    const filters = catalogFiltersSchema.parse(rawFilters);
    const [categories, products] = await Promise.all([
      catalogRepository.listCategories(),
      catalogRepository.listProducts(filters),
    ]);

    return {
      filters,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        productCount: category._count.products,
      })),
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        featured: product.featured,
        imageUrl: product.imageUrl,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
      })),
    };
  },

  async getProductDetail(slug: string) {
    const product = await catalogRepository.findProductBySlug(slug);

    if (!product || !product.active) {
      throw new AppError("Produto nao encontrado.", "PRODUCT_NOT_FOUND");
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceInCents: product.priceInCents,
      stock: product.stock,
      featured: product.featured,
      imageUrl: product.imageUrl,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
    };
  },
};
