import { useEffect, useMemo, useState } from 'react';
import { request } from '../api';
import Header from '../components/Header';

function formatDate(value) {
  return new Date(value).toLocaleString('pt-BR');
}

function normalizeStatus(status) {
  return status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    request('/tasks')
      .then((data) => {
        if (isMounted) {
          setTasks(data);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const counts = { Pendentes: 0, 'Em Andamento': 0, Concluido: 0 };
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <div>
      <Header title="Dashboard">
        <h1>Ordens de manutencao</h1>
      </Header>

      <main className="page-shell">
        <section className="panel summary-grid">
          <article>
            <span>Pendentes</span>
            <strong>{summary.Pendentes}</strong>
          </article>
          <article>
            <span>Em andamento</span>
            <strong>{summary['Em Andamento']}</strong>
          </article>
          <article>
            <span>Concluidas</span>
            <strong>{summary.Concluido}</strong>
          </article>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Lista</p>
              <h2>Chamados registrados</h2>
            </div>
          </div>

          {loading ? (
            <p className="muted">Carregando...</p>
          ) : error ? (
            <p className="feedback">{error}</p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">Nenhum chamado cadastrado ate o momento.</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article key={task.id} className="task-card">
                  <div className="task-card-header">
                    <div>
                      <h3>{task.title}</h3>
                      <p className="muted">Cliente: {task.clientName}</p>
                    </div>
                    <span className={ status-badge status- + normalizeStatus(task.status)}>
                      {task.status}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span>#{task.id}</span>
                    <span>{task.location}</span>
                    <span>{formatDate(task.createdAt)}</span>
                    <span>{task.imageCount || 0} imagem(ns)</span>
                  </div>
                  <p>{task.description}</p>
                  <p className="muted">Responsavel pelo registro: {task.createdByName || 'Nao informado'}</p>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      data-view-id={task.id}
                      onClick={() => window.open(/detail/, '_blank')}
                    >
                      Ver detalhes
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => request(/tasks/, { method: 'PUT', body: JSON.stringify({ status: 'Em Andamento' }) }).then(() => window.location.reload())}
                    >
                      Marcar em andamento
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => request(/tasks/, { method: 'PUT', body: JSON.stringify({ status: 'Concluido' }) }).then(() => window.location.reload())}
                    >
                      Concluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
