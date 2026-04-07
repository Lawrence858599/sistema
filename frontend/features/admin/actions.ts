"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { adminService } from "@/services/admin-service";
import { formDataToObject } from "@/utils/forms";
import { withFlashMessage } from "@/utils/urls";

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();

  try {
    await adminService.saveCategory(formDataToObject(formData));
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    redirect(withFlashMessage("/admin/categories", "success", "Categoria salva com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/admin/categories", "error", getErrorMessage(error)));
  }
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  try {
    const payload = formDataToObject(formData);
    await adminService.deleteCategory(payload.categoryId ?? payload.id ?? "");
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    redirect(withFlashMessage("/admin/categories", "success", "Categoria removida com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/admin/categories", "error", getErrorMessage(error)));
  }
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  try {
    await adminService.saveProduct(formDataToObject(formData));
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    redirect(withFlashMessage("/admin/products", "success", "Produto salvo com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/admin/products", "error", getErrorMessage(error)));
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  try {
    const payload = formDataToObject(formData);
    await adminService.deleteProduct(payload.productId ?? payload.id ?? "");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    redirect(withFlashMessage("/admin/products", "success", "Produto removido com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/admin/products", "error", getErrorMessage(error)));
  }
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  try {
    await adminService.updateOrderStatus(formDataToObject(formData));
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    redirect(withFlashMessage("/admin/orders", "success", "Status do pedido atualizado."));
  } catch (error) {
    redirect(withFlashMessage("/admin/orders", "error", getErrorMessage(error)));
  }
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();

  try {
    await adminService.updateUserRole(formDataToObject(formData));
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    redirect(withFlashMessage("/admin/users", "success", "Permissao atualizada com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/admin/users", "error", getErrorMessage(error)));
  }
}
