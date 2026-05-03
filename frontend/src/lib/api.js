const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const api = {
  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      return data;
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    getToken: () => {
      return localStorage.getItem('token');
    },

    setToken: (token) => {
      localStorage.setItem('token', token);
    },

    getUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },
  },

  users: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load users');
      }

      return response.json();
    },

    getById: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load user');
      }

      return response.json();
    },

    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create user');
      }

      return response.json();
    },

    update: async (userId, payload) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update user');
      }

      return response.json();
    },
  },

  colleges: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/college`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load colleges');
      }

      return response.json();
    },
  },
  questions: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load questions');
      }

      return response.json();
    },

    findWithSections: async () => {
      const response = await fetch(`${API_BASE_URL}/api/questions/with-sections`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load questions with sections');
      }

      return response.json();
    },

    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create question');
      }

      return response.json();
    },

    update: async (questionId, payload) => {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update question');
      }

      return response.json();
    },
  },
  questionSections: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/question-sections`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load question sections');
      }

      return response.json();
    },
  },
};

// Helper function to add auth token to requests
export const getAuthHeaders = () => {
  const token = api.auth.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
