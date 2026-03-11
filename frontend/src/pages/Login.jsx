import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { setSession } from '../session';

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section>
          <p className="eyebrow">Sistema de Manutencao</p>
          <h1>Equipe tecnica</h1>
          <p className="muted">
            Controle ordens em tempo real, registre chamados e acompanhe a evolucao do servico.
          </p>
        </section>
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" placeholder="admin@sistema.com" required />
          </label>
          <label>
            Senha
            <input type="password" name="password" placeholder="******" required />
          </label>
          <button type="submit" className="btn-primary">
            Entrar
          </button>
          <p className="feedback">{error}</p>
        </form>
      </div>
    </div>
  );
}
