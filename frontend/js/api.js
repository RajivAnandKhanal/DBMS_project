// Thin wrapper around the backend REST API.
// Same-origin by default since Express serves this frontend; override if hosted separately.
const API_BASE = window.API_BASE || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

const api = {
  login: (username, password) =>
    apiRequest('/auth/login', { method: 'POST', body: { username, password } }),

  listStudents: (query = '') => apiRequest(`/students${query}`),
  getStudent: (id) => apiRequest(`/students/${id}`),
  createStudent: (payload) => apiRequest('/students', { method: 'POST', body: payload }),
  updateStudent: (id, payload) => apiRequest(`/students/${id}`, { method: 'PUT', body: payload }),
  updateStudentStatus: (id, payload) =>
    apiRequest(`/students/${id}/status`, { method: 'PATCH', body: payload }),
  removeStudent: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
};
