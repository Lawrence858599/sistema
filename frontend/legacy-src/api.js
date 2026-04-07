import { getSession } from './session';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const url = API_BASE_URL + normalizedPath;
  const session = getSession();
  const token = session?.token;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  }

  return data;
}
