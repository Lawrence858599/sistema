import { useState } from 'react';
import Header from '../components/Header';
import { request } from '../api';
import { getSession } from '../session';

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
    reader.onerror = () => reject(new Error(Falha ao ler ));
    reader.readAsDataURL(file);
  });
}

export default function Registro() {
  const [message, setMessage] = useState('');
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    const images = await Promise.all(files.map(readFile));
    setPreviews(images);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const session = getSession();
    if (!session) {
      setMessage('Sessao expirada. Faça login novamente.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...payload, createdBy: session.user.id, images: previews })
      });
      setMessage('Chamado criado com sucesso.');
      event.currentTarget.reset();
      setPreviews([]);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Registros">
        <h1>Novo chamado</h1>
      </Header>
      <main className="page-shell">
        <section className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Titulo
              <input type="text" name="title" placeholder="Ex.: Vazamento" required />
            </label>
            <label>
              Local
              <input type="text" name="location" placeholder="Sala de maquinas" required />
            </label>
            <label>
              Nome do cliente
              <input type="text" name="clientName" placeholder="Carlos Silva" required />
            </label>
            <label>
              Telefone
              <input type="tel" name="clientPhone" placeholder="(11) 99999-9999" required />
            </label>
            <label className="full-width">
              Email
              <input type="email" name="clientEmail" placeholder="cliente@empresa.com" required />
            </label>
            <label className="full-width">
              Descricao
              <textarea
                name="description"
                rows="6"
                placeholder="Detalhe o problema" 
                required
              />
            </label>
            <label className="full-width">
              Imagens do chamado
              <input type="file" id="taskImages" name="taskImages" accept="image/*" multiple onChange={handleImageChange} />
              <small className="muted">As imagens sao convertidas em JSON com metadados.</small>
            </label>
            {previews.length > 0 && (
              <div className="image-preview-grid full-width">
                {previews.map((image) => (
                  <article key={image.fileName} className="preview-card">
                    <img src={image.imageData} alt={image.fileName} />
                    <div>
                      <strong>{image.fileName}</strong>
                      <span className="muted">{Math.round(image.sizeBytes / 1024)} KB</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Registrar chamado'}
            </button>
            <p className="feedback">{message}</p>
          </form>
        </section>
      </main>
    </div>
  );
}
