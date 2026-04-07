import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-block">
      <div className="container empty-state">
        <div>
          <p className="eyebrow">404</p>
          <h1>Conteudo nao encontrado</h1>
          <p>O link pode ter mudado ou o produto nao esta mais disponivel.</p>
        </div>
        <Link className="primary-button" href="/products">
          Voltar ao catalogo
        </Link>
      </div>
    </section>
  );
}
