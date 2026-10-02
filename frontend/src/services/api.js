const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request gagal (${response.status})`);
  }

  return response.json();
}

export function getWilayah() {
  return request('/wilayah');
}

export function getTanam() {
  return request('/tanam');
}

export function getStats() {
  return request('/stats');
}
