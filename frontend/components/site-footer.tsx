import Link from "next/link";
import { appConfig } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <p className="eyebrow">{appConfig.storeName}</p>
          <h3>Loja moderna para uma experiencia clara do primeiro clique ao pos-venda.</h3>
        </div>
        <div>
          <h4>Navegacao</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/products">Catalogo</Link>
            </li>
            <li>
              <Link href="/cart">Carrinho</Link>
            </li>
            <li>
              <Link href="/account">Minha conta</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Atendimento</h4>
          <ul>
            <li>Checkout seguro</li>
            <li>Recuperacao de senha</li>
            <li>Historico de pedidos</li>
            <li>Painel administrativo</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
