const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  register: (email, password) =>
    request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getNotes: () => request('/notes'),

  getNote: (id) => request(`/notes/${id}`),

  createNote: (data) =>
    request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNote: (id, data) =>
    request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteNote: (id) =>
    request(`/notes/${id}`, { method: 'DELETE' }),

  summarize: (title, content) =>
    request('/summarize', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),
};

export { getToken, setAuth, clearAuth, getUser };
