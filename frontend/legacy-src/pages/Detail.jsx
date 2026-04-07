import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTask, updateTask } from '../services/tasks';
import Layout from '../components/Layout';
import { getSession } from '../session';

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

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        imageData: reader.result
      });
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}


export default function Detail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    location: '',
    status: '',
    description: '',
    imagesToAdd: []
  });

  useEffect(() => {
    if (!id) {
      setLoadError('Chamado nao informado.');
      return;
    }

    getTask(id)
      .then((data) => {
        setTask(data);
        setForm({
          title: data.title || '',
          clientName: data.clientName || '',
          clientPhone: data.clientPhone || '',
          clientEmail: data.clientEmail || '',
          location: data.location || '',
          status: data.status || '',
          description: data.description || '',
          imagesToAdd: []
        });
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  useEffect(() => {
    if (!id || editing) return undefined;

    const timer = setInterval(() => {
      getTask(id)
        .then((data) => {
          setTask(data);
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(timer);
  }, [id, editing]);


  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const maxImages = 20;

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const existingCount = task?.images?.length || 0;
    const currentAdded = form.imagesToAdd.length;
    const remaining = Math.max(0, maxImages - existingCount - currentAdded);

    if (remaining <= 0) {
      setFormError(`Limite de ${maxImages} imagens atingido para este chamado.`);
      event.target.value = '';
      return;
    }

    const selected = files.slice(0, remaining);
    if (selected.length < files.length) {
      setFormError(`Somente ${remaining} imagem(ns) podem ser adicionadas (max ${maxImages}).`);
    }

    try {
      const images = await Promise.all(selected.map(readFile));
      setForm((prev) => ({ ...prev, imagesToAdd: [...prev.imagesToAdd, ...images] }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveNewImage = (fileName) => {
    setForm((prev) => ({
      ...prev,
      imagesToAdd: prev.imagesToAdd.filter((img) => img.fileName !== fileName)
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setFormError('');
    try {
      const body = {
        title: form.title,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail,
        location: form.location,
        status: form.status,
        description: form.description,
        ...(form.imagesToAdd.length ? { images: form.imagesToAdd } : {})
      };

      const updated = await updateTask(id, body);
      setTask(updated);
      setForm({
        title: updated.title || '',
        clientName: updated.clientName || '',
        clientPhone: updated.clientPhone || '',
        clientEmail: updated.clientEmail || '',
        location: updated.location || '',
        status: updated.status || '',
        description: updated.description || '',
        imagesToAdd: []
      });
      setEditing(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <Layout title="Chamado" subtitle="Erro">
        <section className="panel">
          <p className="feedback">{loadError}</p>
        </section>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout title="Chamado" subtitle="Carregando...">
        <section className="panel">
          <p className="muted">Buscando detalhes...</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="Chamado" subtitle={task.title}>
      <div className="detail-page">
        {isAdmin && (
          <section className="panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Admin</p>
                <h2>Editar chamado</h2>
              </div>
              <div className="section-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing((prev) => !prev)}
                  disabled={saving}
                >
                  {editing ? 'Cancelar' : 'Alterar informacoes'}
                </button>
                {editing && (
                  <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
              </div>
            </div>

            {editing && (
              <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
                <label>
                  Titulo
                  <input name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange} required>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluido">Concluido</option>
                  </select>
                </label>
                <label>
                  Nome do cliente
                  <input name="clientName" value={form.clientName} onChange={handleChange} required />
                </label>
                <label>
                  Telefone
                  <input name="clientPhone" value={form.clientPhone} onChange={handleChange} required />
                </label>
                <label className="full-width">
                  Email
                  <input name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} required />
                </label>
                <label className="full-width">
                  Local
                  <input name="location" value={form.location} onChange={handleChange} required />
                </label>
                <label className="full-width">
                  Descricao
                  <textarea
                    name="description"
                    rows="6"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="full-width">
                  Imagens novas (max 20 no total)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <small className="muted">
                    Existentes: {task.images?.length || 0} | Novas: {form.imagesToAdd.length} | Limite: 20
                  </small>
                </label>

                {form.imagesToAdd.length > 0 && (
                  <div className="image-preview-grid full-width">
                    {form.imagesToAdd.map((image) => (
                      <article key={image.fileName} className="preview-card">
                        <img src={image.imageData} alt={image.fileName} />
                        <div>
                          <strong>{image.fileName}</strong>
                          <span className="muted">{Math.round(image.sizeBytes / 1024)} KB</span>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => handleRemoveNewImage(image.fileName)}
                          >
                            Remover
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {formError && <p className="feedback full-width">{formError}</p>}
              </form>
            )}
          </section>
        )}
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
              <span className={`status-badge status-${normalizeStatus(task.status)}`}>
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
      </div>
    </Layout>
  );
}
