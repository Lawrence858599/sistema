import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { request } from '../api';
import { getSession } from '../session';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR');
}

export default function Users() {
  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;
    request('/users')
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const handleRoleChange = (userId, role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const handleSaveRole = async (userId, role) => {
    setSavingId(userId);
    setError('');
    try {
      const updated = await request(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Layout title="Usuarios" subtitle="Sem permissao">
        <section className="panel">
          <p className="feedback">Apenas admin pode gerenciar usuarios.</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="Usuarios" subtitle="Permissoes">
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Usuarios cadastrados</h2>
          </div>
        </div>

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : error ? (
          <p className="feedback">{error}</p>
        ) : users.length === 0 ? (
          <p className="empty-state">Nenhum usuario encontrado.</p>
        ) : (
          <div className="task-list">
            {users.map((user) => (
              <article key={user.id} className="task-card">
                <div className="task-card-header">
                  <div>
                    <h3>{user.name}</h3>
                    <p className="muted">{user.email}</p>
                  </div>
                  <span className="status-badge status-em-andamento">{user.role}</span>
                </div>
                <div className="task-meta">
                  <span>#{user.id}</span>
                  <span>Criado: {formatDate(user.createdAt) || '---'}</span>
                </div>
                <div className="task-actions">
                  <label>
                    Permissao
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingId === user.id}
                    onClick={() => handleSaveRole(user.id, user.role)}
                  >
                    {savingId === user.id ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
