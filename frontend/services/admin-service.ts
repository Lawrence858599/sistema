import { AppError } from "@/lib/errors";
import { adminRepository } from "@/repositories/admin-repository";
import { catalogRepository } from "@/repositories/catalog-repository";
import { orderRepository } from "@/repositories/order-repository";
import {
  categoryFormSchema,
  orderStatusSchema,
  productFormSchema,
  roleUpdateSchema,
} from "@/features/admin/schemas";
import { slugify } from "@/utils/strings";

export const adminService = {
  async getDashboardData() {
    const [metrics, categories, products, orders, users] = await Promise.all([
      adminRepository.getDashboardMetrics(),
      adminRepository.listCategories(),
      catalogRepository.listAdminProducts(),
      orderRepository.listAll(),
      adminRepository.listUsers(),
    ]);

    return {
      metrics,
      categories,
      products,
      orders,
      users,
    };
  },

  async saveCategory(input: Record<string, string | undefined>) {
    const payload = categoryFormSchema.parse(input);

    return adminRepository.saveCategory({
      ...payload,
      slug: slugify(payload.slug || payload.name),
    });
  },

  async deleteCategory(categoryId: string) {
    const linkedProducts = await adminRepository.countProductsByCategory(categoryId);
    if (linkedProducts > 0) {
      throw new AppError(
        "Remova ou mova os produtos da categoria antes de exclui-la.",
      );
    }

    return adminRepository.deleteCategory(categoryId);
  },

  async saveProduct(input: Record<string, string | undefined>) {
    const payload = productFormSchema.parse(input);

    return adminRepository.saveProduct({
      ...payload,
      slug: slugify(payload.slug || payload.name),
    });
  },

  deleteProduct(productId: string) {
    return adminRepository.deleteProduct(productId);
  },

  async updateOrderStatus(input: Record<string, string | undefined>) {
    const payload = orderStatusSchema.parse(input);
    return orderRepository.updateStatus(payload.orderId, payload.status);
  },

  async updateUserRole(input: Record<string, string | undefined>) {
    const payload = roleUpdateSchema.parse(input);
    return adminRepository.updateUserRole(payload.userId, payload.role);
  },
};
