import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// Workspace APIs
export const workspaceAPI = {
  create: (data: { name: string; description?: string }) =>
    api.post('/workspaces', data),
  getAll: () => api.get('/workspaces'),
  getOne: (workspaceId: string) => api.get(`/workspaces/${workspaceId}`),
  update: (workspaceId: string, data: { name?: string; description?: string }) =>
    api.put(`/workspaces/${workspaceId}`, data),
  delete: (workspaceId: string) => api.delete(`/workspaces/${workspaceId}`),
  addMember: (workspaceId: string, data: { email: string; role?: string }) =>
    api.post(`/workspaces/${workspaceId}/members`, data),
  getMembers: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/members`),
  removeMember: (workspaceId: string, userId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
};

// Board APIs
export const boardAPI = {
  create: (data: { name: string; description?: string; workspaceId: string; backgroundColor?: string }) =>
    api.post('/boards', data),
  getByWorkspace: (workspaceId: string) =>
    api.get(`/boards/workspace/${workspaceId}`),
  getOne: (boardId: string) => api.get(`/boards/${boardId}`),
  update: (boardId: string, data: { name?: string; description?: string; backgroundColor?: string }) =>
    api.put(`/boards/${boardId}`, data),
  delete: (boardId: string) => api.delete(`/boards/${boardId}`),
  createList: (boardId: string, data: { name: string }) =>
    api.post(`/boards/${boardId}/lists`, data),
  updateList: (boardId: string, listId: string, data: { name?: string; position?: number }) =>
    api.put(`/boards/${boardId}/lists/${listId}`, data),
  deleteList: (boardId: string, listId: string) =>
    api.delete(`/boards/${boardId}/lists/${listId}`),
  getActivity: (boardId: string) => api.get(`/boards/${boardId}/activity`),
};

// Card APIs
export const cardAPI = {
  create: (data: {
    title: string;
    listId: string;
    boardId: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    labels?: string[];
  }) => api.post('/cards', data),
  getOne: (cardId: string) => api.get(`/cards/${cardId}`),
  update: (cardId: string, data: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    labels?: string[];
    assignedTo?: string;
  }) => api.put(`/cards/${cardId}`, data),
  move: (cardId: string, data: { listId: string; position: number }) =>
    api.put(`/cards/${cardId}/move`, data),
  delete: (cardId: string) => api.delete(`/cards/${cardId}`),
  search: (params: { q?: string; boardId?: string; priority?: string; assignedTo?: string }) =>
    api.get('/cards/search', { params }),
  addComment: (cardId: string, data: { content: string }) =>
    api.post(`/cards/${cardId}/comments`, data),
  deleteComment: (cardId: string, commentId: string) =>
    api.delete(`/cards/${cardId}/comments/${commentId}`),
  addChecklist: (cardId: string, data: { title: string }) =>
    api.post(`/cards/${cardId}/checklists`, data),
  updateChecklist: (cardId: string, checklistId: string, data: { title?: string; isCompleted?: boolean }) =>
    api.put(`/cards/${cardId}/checklists/${checklistId}`, data),
  deleteChecklist: (cardId: string, checklistId: string) =>
    api.delete(`/cards/${cardId}/checklists/${checklistId}`),
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getOne: (userId: string) => api.get(`/users/${userId}`),
  search: (q: string) => api.get('/users/search', { params: { q } }),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
};

// Upload APIs
export const uploadAPI = {
  uploadCardAttachment: (cardId: string, file: FormData) =>
    api.post(`/upload/card/${cardId}`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadAvatar: (file: FormData) =>
    api.post('/upload/avatar', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (attachmentId: string) =>
    api.delete(`/upload/attachment/${attachmentId}`),
};

export default api;
