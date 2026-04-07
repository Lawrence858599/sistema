const isProduction = process.env.NODE_ENV === "production";

export const appConfig = {
  isProduction,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "Lume Store",
  customerDocumentLabel:
    process.env.NEXT_PUBLIC_CUSTOMER_DOCUMENT_LABEL ?? "CPF",
  authSecret: process.env.AUTH_SECRET ?? "dev-auth-secret-change-me",
  sessionDurationInDays: 14,
  passwordResetWindowInMinutes: 30,
};

if (isProduction && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET precisa ser definido em producao.");
}
