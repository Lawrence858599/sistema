import { EmptyState } from "@/components/empty-state";
import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/submit-button";
import { createOrderAction } from "@/features/checkout/actions";
import { appConfig } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { orderService } from "@/services/order-service";
import { formatCurrency } from "@/utils/currency";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const currentUser = await requireUser("/checkout");
  const resolvedSearchParams = await searchParams;
  const checkoutData = await orderService.getCheckoutData(currentUser.id);
  const cartItems = checkoutData.cart?.items ?? [];
  const subtotalInCents = cartItems.reduce(
    (total, item) => total + item.quantity * item.product.priceInCents,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <section className="section-block">
        <div className="container">
          <EmptyState
            actionHref="/products"
            actionLabel="Adicionar produtos"
            description="Seu checkout precisa de itens no carrinho para continuar."
            title="Carrinho vazio"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container page-heading">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Confirme entrega, forma de pagamento e itens do pedido.</h1>
        </div>
        <FlashMessage
          message={getSingleSearchParam(resolvedSearchParams.error)}
          type="error"
        />
      </div>

      <div className="container checkout-layout">
        <form action={createOrderAction} className="panel form-panel">
          <div className="form-grid">
            <label>
              Nome completo
              <input defaultValue={checkoutData.user.fullName} name="fullName" required />
            </label>
            <label>
              Telefone
              <input defaultValue={checkoutData.user.phone ?? ""} name="phone" />
            </label>
            <label>
              {appConfig.customerDocumentLabel}
              <input defaultValue={checkoutData.user.documentValue ?? ""} name="documentValue" />
            </label>
            <label>
              Destinatario
              <input
                defaultValue={checkoutData.user.address?.recipientName ?? checkoutData.user.fullName}
                name="recipientName"
              />
            </label>
            <label className="form-grid__wide">
              Endereco
              <input defaultValue={checkoutData.user.address?.line1 ?? ""} name="line1" required />
            </label>
            <label>
              Complemento
              <input defaultValue={checkoutData.user.address?.line2 ?? ""} name="line2" />
            </label>
            <label>
              Bairro
              <input defaultValue={checkoutData.user.address?.district ?? ""} name="district" />
            </label>
            <label>
              Cidade
              <input defaultValue={checkoutData.user.address?.city ?? ""} name="city" required />
            </label>
            <label>
              Estado
              <input defaultValue={checkoutData.user.address?.state ?? ""} name="state" required />
            </label>
            <label>
              CEP
              <input defaultValue={checkoutData.user.address?.postalCode ?? ""} name="postalCode" required />
            </label>
            <label>
              Pais
              <input defaultValue={checkoutData.user.address?.country ?? "Brasil"} name="country" />
            </label>
          </div>

          <fieldset className="payment-options">
            <legend>Pagamento simulado</legend>
            <label>
              <input defaultChecked name="paymentMethod" type="radio" value="PIX" />
              PIX
            </label>
            <label>
              <input name="paymentMethod" type="radio" value="CREDIT_CARD" />
              Cartao de credito
            </label>
            <label>
              <input name="paymentMethod" type="radio" value="BANK_SLIP" />
              Boleto
            </label>
          </fieldset>

          <SubmitButton
            className="primary-button"
            label="Finalizar pedido"
            pendingLabel="Processando pedido..."
          />
        </form>

        <aside className="summary-card">
          <p className="eyebrow">Resumo do pedido</p>
          <h2>{cartItems.length} itens selecionados</h2>
          <div className="stack-list compact">
            {cartItems.map((item) => (
              <div className="summary-line" key={item.id}>
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <strong>{formatCurrency(item.product.priceInCents * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(subtotalInCents)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
