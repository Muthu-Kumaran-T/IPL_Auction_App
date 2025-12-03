// frontend/src/services/api.js
import axios from 'axios';

const API_URL = '/api'; // This will use the proxy configured in package.json

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Room API
export const roomAPI = {
  createRoom: (roomData) => api.post('/room/create', roomData),
  joinRoom: (data) => api.post('/room/join', data),
  getRoomDetails: (roomId) => api.get(`/room/${roomId}`),
  getTeams: (roomId) => api.get(`/room/${roomId}/teams`),
  getMyRooms: () => api.get('/room/my-rooms'),
  updatePlayingXI: (roomId, data) => api.put(`/room/${roomId}/playing-xi`, data)
};

// Player API
export const playerAPI = {
  uploadPlayers: (roomId, formData) => 
    api.post(`/player/upload/${roomId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getPlayers: (roomId) => api.get(`/player/${roomId}`),
  getPlayerById: (playerId) => api.get(`/player/details/${playerId}`)
};

export default api;