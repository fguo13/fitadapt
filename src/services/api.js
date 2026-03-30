const BASE = '/api';

const getToken = () => localStorage.getItem('fitadapt_token');

async function req(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password, name) =>
      req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  },
  users: {
    me: () => req('/users/me'),
    onboarding: (data) =>
      req('/users/me/onboarding', { method: 'POST', body: JSON.stringify(data) }),
    skills: () => req('/users/me/skills'),
    stats: () => req('/users/me/stats'),
  },
  workouts: {
    generate: () => req('/workouts/generate', { method: 'POST' }),
    list: (page = 0, size = 5) => req(`/workouts?page=${page}&size=${size}`),
    get: (id) => req(`/workouts/${id}`),
    log: (id, entries) =>
      req(`/workouts/${id}/log`, { method: 'POST', body: JSON.stringify({ entries }) }),
    feedback: (id, data) =>
      req(`/workouts/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
