import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';
import { getSession } from '../session';

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  const { tasks, loading, error, updateTask, updatingMap } = useTasks({ pollMs: 15000 });

  const summary = useMemo(() => {
    const counts = { Pendente: 0, 'Em Andamento': 0, Concluido: 0 };
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return tasks;
    return tasks.filter((task) => normalizeText(task.title).includes(normalizedQuery));
  }, [tasks, query]);

  const handleUpdateStatus = async (taskId, status) => {
    await updateTask(taskId, { status });
  };

  return (
    <Layout title="Dashboard" subtitle="Ordens de manutencao">
      <section className="panel summary-grid">
        <article>
          <span>Pendentes</span>
          <strong>{summary.Pendente}</strong>
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
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Pesquisar chamado pelo titulo..."
          />
        </div>

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : error ? (
          <p className="feedback">{error}</p>
        ) : filteredTasks.length === 0 ? (
          query ? (
            <p className="empty-state">Nenhum chamado encontrado para "{query}".</p>
          ) : (
            <p className="empty-state">Nenhum chamado cadastrado ate o momento.</p>
          )
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isAdmin={isAdmin}
                updating={Boolean(updatingMap.get(task.id))}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
