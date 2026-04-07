const BASE_URL = "http://localhost";

export function withFlashMessage(
  path: string,
  type: "success" | "error",
  message: string,
) {
  const url = new URL(path, BASE_URL);
  url.searchParams.set(type, message);
  return `${url.pathname}${url.search}`;
}

export function getSafeRedirectPath(value: FormDataEntryValue | null | undefined) {
  const fallback = "/";
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }

  return normalized;
}
