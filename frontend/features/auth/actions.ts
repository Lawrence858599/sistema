"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroyUserSession, createUserSession, requireUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth-service";
import { formDataToObject } from "@/utils/forms";
import { getSafeRedirectPath, withFlashMessage } from "@/utils/urls";

export async function loginAction(formData: FormData) {
  const nextPath = getSafeRedirectPath(formData.get("next"));

  try {
    const payload = formDataToObject(formData);
    const user = await authService.login({
      email: payload.email ?? "",
      password: payload.password ?? "",
    });

    await createUserSession(user);
    revalidatePath("/");
    redirect(nextPath);
  } catch (error) {
    const basePath = nextPath !== "/" ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
    redirect(withFlashMessage(basePath, "error", getErrorMessage(error)));
  }
}

export async function registerAction(formData: FormData) {
  const nextPath = getSafeRedirectPath(formData.get("next"));

  try {
    const payload = formDataToObject(formData);
    const user = await authService.register({
      fullName: payload.fullName ?? "",
      email: payload.email ?? "",
      password: payload.password ?? "",
      confirmPassword: payload.confirmPassword ?? "",
    });

    await createUserSession(user);
    revalidatePath("/");
    redirect(nextPath === "/" ? "/account" : nextPath);
  } catch (error) {
    const basePath = nextPath !== "/" ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";
    redirect(withFlashMessage(basePath, "error", getErrorMessage(error)));
  }
}

export async function logoutAction() {
  await destroyUserSession();
  revalidatePath("/");
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  try {
    const payload = formDataToObject(formData);
    const token = await authService.requestPasswordReset({
      email: payload.email ?? "",
    });

    if (token && process.env.NODE_ENV !== "production") {
      redirect(`/reset-password/${token}?preview=1`);
    }

    redirect(
      withFlashMessage(
        "/forgot-password",
        "success",
        "Se o e-mail existir, o link de redefinicao foi gerado com sucesso.",
      ),
    );
  } catch (error) {
    redirect(withFlashMessage("/forgot-password", "error", getErrorMessage(error)));
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const payload = formDataToObject(formData);
    await authService.resetPassword({
      token: payload.token ?? "",
      password: payload.password ?? "",
      confirmPassword: payload.confirmPassword ?? "",
    });

    redirect(
      withFlashMessage(
        "/login",
        "success",
        "Senha atualizada com sucesso. Entre com a nova senha.",
      ),
    );
  } catch (error) {
    const token = `${formData.get("token") ?? ""}`;
    redirect(withFlashMessage(`/reset-password/${token}`, "error", getErrorMessage(error)));
  }
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser("/account");

  try {
    await authService.updateProfile(user.id, formDataToObject(formData));
    revalidatePath("/");
    revalidatePath("/account");
    redirect(withFlashMessage("/account", "success", "Dados atualizados com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/account", "error", getErrorMessage(error)));
  }
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser("/account");

  try {
    const payload = formDataToObject(formData);
    await authService.changePassword(user.id, {
      currentPassword: payload.currentPassword ?? "",
      password: payload.password ?? "",
      confirmPassword: payload.confirmPassword ?? "",
    });

    redirect(withFlashMessage("/account", "success", "Senha alterada com sucesso."));
  } catch (error) {
    redirect(withFlashMessage("/account", "error", getErrorMessage(error)));
  }
}
