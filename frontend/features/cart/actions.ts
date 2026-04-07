"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { cartService } from "@/services/cart-service";
import { formDataToObject } from "@/utils/forms";
import { getSafeRedirectPath, withFlashMessage } from "@/utils/urls";

function redirectToLogin(nextPath: string): never {
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

export async function addToCartAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirectToLogin("/cart");
  }

  try {
    const payload = formDataToObject(formData);
    await cartService.addItem(currentUser.id, {
      productId: payload.productId ?? "",
      quantity: Number(payload.quantity ?? 1),
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/cart");
    redirect(withFlashMessage("/cart", "success", "Produto adicionado ao carrinho."));
  } catch (error) {
    redirect(withFlashMessage("/cart", "error", getErrorMessage(error)));
  }
}

export async function updateCartItemAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirectToLogin("/cart");
  }

  try {
    const payload = formDataToObject(formData);
    await cartService.updateQuantity(currentUser.id, {
      productId: payload.productId ?? "",
      quantity: Number(payload.quantity ?? 0),
    });

    revalidatePath("/cart");
    revalidatePath("/");
    redirect("/cart");
  } catch (error) {
    redirect(withFlashMessage("/cart", "error", getErrorMessage(error)));
  }
}

export async function removeCartItemAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirectToLogin("/cart");
  }

  try {
    const payload = formDataToObject(formData);
    await cartService.removeItem(currentUser.id, payload.productId ?? "");
    revalidatePath("/cart");
    revalidatePath("/");
    redirect("/cart");
  } catch (error) {
    redirect(withFlashMessage("/cart", "error", getErrorMessage(error)));
  }
}
