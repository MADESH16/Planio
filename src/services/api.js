/**
 * Planio API Client
 * Connects to Express & PostgreSQL Backend on http://localhost:5000
 */

const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('planio_auth_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  },

  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data.user;
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`);
    const data = await res.json();
    return data.users || [];
  },

  // Tasks
  getTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`);
    const data = await res.json();
    return data.tasks || [];
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create task');
    return data.task;
  },

  updateTask: async (id, taskData) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update task');
    return data.task;
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete task');
    return data;
  },

  // Commits
  linkCommit: async (commitData) => {
    const res = await fetch(`${API_BASE}/commits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commitData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to link commit');
    return data.commit;
  },

  getTaskCommits: async (taskId) => {
    const res = await fetch(`${API_BASE}/commits/task/${taskId}`);
    const data = await res.json();
    return data.commits || [];
  },

  // Webhook Simulator
  simulatePushWebhook: async (payload) => {
    const res = await fetch(`${API_BASE}/webhooks/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },
};
