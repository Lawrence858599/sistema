import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSession } from '../session';

export default function Home() {
  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <Layout title="Home" subtitle="Painel">
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Atalhos</p>
            <h2>Manutencoes</h2>
          </div>
        </div>

        <div className="summary-grid">
          <article>
            <span className="muted">Acompanhar chamados</span>
            <strong>Dashboard</strong>
            <div className="task-actions">
              <Link className="btn-primary" to="/dashboard">
                Acessar
              </Link>
            </div>
          </article>

          <article>
            <span className="muted">Registrar novo chamado</span>
            <strong>Novo chamado</strong>
            <div className="task-actions">
              <Link className="btn-secondary" to="/registro">
                Abrir
              </Link>
            </div>
          </article>

          {isAdmin && (
            <article>
              <span className="muted">Perfis e permissoes</span>
              <strong>Usuarios</strong>
              <div className="task-actions">
                <Link className="btn-secondary" to="/usuarios">
                  Gerenciar
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Auto update</p>
            <h2>Atualizacao automatica</h2>
          </div>
        </div>
        <p className="muted">
          O Dashboard atualiza automaticamente a lista de chamados (polling leve) e as acoes atualizam a tela sem
          recarregar o site.
        </p>
      </section>
    </Layout>
  );
}
