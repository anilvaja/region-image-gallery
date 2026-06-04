import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
