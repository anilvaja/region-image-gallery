import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Origin that serves static assets (uploaded images), i.e. the API base without
// the trailing `/api`. Uploaded image URLs are stored as `/uploads/...` paths
// relative to the backend, so they must be resolved against this origin.
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${ASSET_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Project endpoints
export const projectAPI = {
  createProject: (projectData) => api.post('/projects', projectData),
  getUserProjects: () => api.get('/projects'),
  getProjectById: (projectId) => api.get(`/projects/${projectId}`),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
};

// Region endpoints
export const regionAPI = {
  getRegions: () => api.get('/regions'),
};

// Settings endpoints
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
};

// Image endpoints
export const imageAPI = {
  uploadImage: (projectId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/images/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getProjectImages: (projectId) => api.get(`/images/${projectId}`),
  getGallery: () => api.get('/images/gallery'),
  deleteImage: (imageId) => api.delete(`/images/${imageId}/delete`),
};

export default api;
