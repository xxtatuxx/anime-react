import axios from 'axios';

// Base URL for API - detects the current origin
const getBaseUrl = () => {
  const origin = window.location.origin;

  // If running React dev server (Vite), use Laravel server
  if (origin.includes('localhost:5173') || origin.includes('127.0.0.1:5173')) {
    return 'http://127.0.0.1:8001';
  }

  // If running from Laravel public folder, use same origin
  return origin;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// API Services
export const homeService = {
  // Get home page data
  getHome: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/api/react/home', { params });
    return response.data;
  },

  // Get episodes with pagination
  getEpisodes: async (page = 1, search = '') => {
    const params = { page };
    if (search) params.search = search;
    const response = await api.get('/api/react/episodes', { params });
    return response.data;
  },

  // Get anime list
  getAnime: async (params = {}) => {
    const response = await api.get('/api/react/anime', { params });
    return response.data;
  },

  // Get movies list
  getMovies: async (params = {}) => {
    const response = await api.get('/api/react/movies', { params });
    return response.data;
  },

  // Get single anime details
  getAnimeShow: async (animeId) => {
    const response = await api.get(`/api/react/anime/${animeId}`);
    return response.data;
  },
};

// User Services (requires auth)
export const userService = {
  // Get notifications
  getNotifications: async (page = 1) => {
    const response = await api.get('/api/react/notifications', { params: { page } });
    return response.data;
  },

  // Mark notifications as read
  markNotificationsRead: async () => {
    const response = await api.post('/api/react/notifications/mark-read');
    return response.data;
  },

  // Get watch later list
  getWatchLater: async (page = 1) => {
    const response = await api.get('/api/react/watch-later', { params: { page } });
    return response.data;
  },

  // Add to watch later
  addWatchLater: async (episodeId) => {
    const response = await api.post(`/api/react/watch-later/${episodeId}`);
    return response.data;
  },

  // Remove from watch later
  removeWatchLater: async (episodeId) => {
    const response = await api.delete(`/api/react/watch-later/${episodeId}`);
    return response.data;
  },

  // Get watch history
  getHistory: async (page = 1) => {
    const response = await api.get('/api/react/history', { params: { page } });
    return response.data;
  },

  // Record activity (watch, comment, like, reply)
  recordActivity: async (episodeId, type, metadata = null) => {
    const response = await api.post('/api/react/history/record', {
      episode_id: episodeId,
      type, // 'watch', 'comment', 'like', 'reply'
      metadata,
    });
    return response.data;
  },
};

export default api;
