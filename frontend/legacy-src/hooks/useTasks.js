import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listTasks, updateTask as updateTaskApi } from '../services/tasks';

export function useTasks({ pollMs = 15000 } = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingIds, setUpdatingIds] = useState(() => new Set());

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await listTasks();
      if (!mountedRef.current) return;
      setTasks(data);
      setError('');
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!pollMs) return undefined;
    const id = setInterval(() => {
      refresh();
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs, refresh]);

  const updateTask = useCallback(async (taskId, patch) => {
    setUpdatingIds((prev) => new Set(prev).add(taskId));
    try {
      const updated = await updateTaskApi(taskId, patch);
      if (!mountedRef.current) return updated;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
      return updated;
    } finally {
      if (!mountedRef.current) return;
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }, []);

  const updatingMap = useMemo(() => {
    const map = new Map();
    updatingIds.forEach((id) => map.set(id, true));
    return map;
  }, [updatingIds]);

  return {
    tasks,
    setTasks,
    loading,
    error,
    refresh,
    updateTask,
    updatingMap
  };
}

