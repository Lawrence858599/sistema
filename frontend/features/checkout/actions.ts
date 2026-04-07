"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { orderService } from "@/services/order-service";
import { formDataToObject } from "@/utils/forms";
import { withFlashMessage } from "@/utils/urls";

export async function createOrderAction(formData: FormData) {
  const currentUser = await requireUser("/checkout");

  try {
    const payload = formDataToObject(formData);
    const order = await orderService.placeOrder(currentUser.id, {
      fullName: payload.fullName ?? "",
      phone: payload.phone,
      documentValue: payload.documentValue,
      recipientName: payload.recipientName,
      line1: payload.line1,
      line2: payload.line2,
      district: payload.district,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      paymentMethod: (payload.paymentMethod as "PIX" | "CREDIT_CARD" | "BANK_SLIP") ?? "PIX",
    });

    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    redirect(
      withFlashMessage(
        "/account/orders",
        "success",
        `Pedido ${order.orderNumber} criado com sucesso.`,
      ),
    );
  } catch (error) {
    redirect(withFlashMessage("/checkout", "error", getErrorMessage(error)));
  }
}
