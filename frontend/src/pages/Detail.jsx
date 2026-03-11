import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function Detail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Chamado nao informado.');
      return;
    }

    request(/tasks/)
      .then((data) => setTask(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div>
        <Header title="Chamado">
          <h1>Erro</h1>
        </Header>
        <main className="page-shell">
          <p className="feedback">{error}</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <Header title="Chamado">
          <h1>Carregando...</h1>
        </Header>
        <main className="page-shell">
          <p className="muted">Buscando detalhes...</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header title="Chamado">
        <h1>{task.title}</h1>
      </Header>
      <main className="page-shell detail-page">
        <section className="panel detail-summary">
          <div className="detail-grid">
            <article className="detail-block">
              <strong>Cliente</strong>
              <span>{task.clientName}</span>
            </article>
            <article className="detail-block">
              <strong>Telefone</strong>
              <span>{task.clientPhone}</span>
            </article>
            <article className="detail-block">
              <strong>Email</strong>
              <span>{task.clientEmail}</span>
            </article>
            <article className="detail-block">
              <strong>Local</strong>
              <span>{task.location}</span>
            </article>
            <article className="detail-block">
              <strong>Responsavel</strong>
              <span>{task.createdByName}</span>
            </article>
            <article className="detail-block">
              <strong>Status</strong>
              <span className={ status-badge status- + normalizeStatus(task.status)}>
                {task.status}
              </span>
            </article>
          </div>
        </section>
        <section className="panel detail-description">
          <div className="section-head">
            <div>
              <p className="eyebrow">Descricao</p>
              <h2>Detalhe do problema</h2>
            </div>
          </div>
          <p>{task.description}</p>
        </section>
        <section className="panel detail-gallery-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Imagens anexadas</p>
              <h2>Documentacao visual</h2>
            </div>
          </div>
          <div className="modal-gallery">
            {task.images && task.images.length > 0 ? (
              task.images.map((image) => (
                <article key={image.id} className="gallery-card">
                  <img src={image.imageData} alt={image.fileName} />
                  <div>
                    <strong>{image.fileName}</strong>
                    <span className="muted">{image.mimeType}</span>
                    <span className="muted">{Math.round(image.sizeBytes / 1024)} KB</span>
                    <div className="gallery-actions">
                      <a
                        className="btn-ghost gallery-download"
                        href={image.imageData}
                        download={image.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Baixar
                      </a>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">Nenhuma imagem anexada.</p>
            )}
          </div>
        </section>
        <section className="panel detail-history">
          <div className="section-head">
            <div>
              <p className="eyebrow">Historico</p>
              <h2>Atualizacoes</h2>
            </div>
          </div>
          <ul className="history-list">
            <li>
              <strong>Criado em</strong>
              <span>{formatDate(task.createdAt)}</span>
            </li>
            <li>
              <strong>Atualizado em</strong>
              <span>{formatDate(task.updatedAt || task.createdAt)}</span>
            </li>
            <li>
              <strong>Status atual</strong>
              <span>{task.status}</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
