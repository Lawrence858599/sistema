import { Link, useNavigate } from 'react-router-dom';

function formatDate(value) {
  return new Date(value).toLocaleString('pt-BR');
}

function normalizeStatus(status) {
  return status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');
}

export default function TaskCard({ task, isAdmin, onUpdateStatus, updating }) {
  const navigate = useNavigate();

  return (
    <article className="task-card">
      <div className="task-card-header">
        <div>
          <h3>{task.title}</h3>
          <p className="muted">Cliente: {task.clientName}</p>
        </div>
        <span className={`status-badge status-${normalizeStatus(task.status)}`}>{task.status}</span>
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
        <Link className="btn-ghost" to={`/detail/${task.id}`}>
          Ver detalhes
        </Link>

        {isAdmin && (
          <button type="button" className="btn-secondary" onClick={() => navigate(`/detail/${task.id}`)}>
            Alterar
          </button>
        )}

        {isAdmin && (
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={updating}
              onClick={() => onUpdateStatus(task.id, 'Em Andamento')}
            >
              {updating ? 'Atualizando...' : 'Marcar em andamento'}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={updating}
              onClick={() => onUpdateStatus(task.id, 'Concluido')}
            >
              {updating ? 'Atualizando...' : 'Concluir'}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
