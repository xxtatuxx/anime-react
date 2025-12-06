import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for API - must match your Laravel server
const getApiBaseUrl = () => {
    if (Platform.OS === 'web') {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        if (origin.includes('localhost:8081') || origin.includes('127.0.0.1:8081')) {
            return 'http://127.0.0.1:8001';
        }
        if (origin.includes(':8001')) {
            return origin;
        }
        return 'http://127.0.0.1:8001';
    }

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8001';
    }

    return 'http://127.0.0.1:8001';
};

export const API_BASE_URL = getApiBaseUrl();
console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log('[API] Error getting token:', error);
    }
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('[API] Response OK:', response.config.url);
        return response;
    },
    (error) => {
        console.error('[API] Error:', error.message);
        if (error.response) {
            console.error('[API] Status:', error.response.status);
        }
        if (error.code === 'ERR_NETWORK') {
            console.error('[API] Network error - Check if Laravel server is running');
        }
        return Promise.reject(error);
    }
);

export const homeService = {
    getHome: async (search = '') => {
        try {
            const params = search ? { search } : {};
            const response = await api.get('/api/react/home', { params });
            return {
                ...response.data,
                latestEpisodes: response.data.episodes
            };
        } catch (error) {
            console.error('[homeService.getHome] Error:', error.message);
            return { latestEpisodes: [] };
        }
    },

    getEpisodes: async (page = 1, search = '') => {
        try {
            const params = { page };
            if (search) params.search = search;
            const response = await api.get('/api/react/episodes', { params });
            return {
                episodes: response.data
            };
        } catch (error) {
            console.error('[homeService.getEpisodes] Error:', error.message);
            return { episodes: { data: [], current_page: 1, last_page: 1 } };
        }
    },

    getAnime: async (params = {}) => {
        try {
            const response = await api.get('/api/react/anime', { params });
            return {
                ...response.data,
                series: response.data.animes
            };
        } catch (error) {
            console.error('[homeService.getAnime] Error:', error.message);
            return { series: { data: [], current_page: 1, last_page: 1 } };
        }
    },

    getMovies: async (params = {}) => {
        try {
            const response = await api.get('/api/react/movies', { params });
            return {
                ...response.data,
                movies: response.data.animes
            };
        } catch (error) {
            console.error('[homeService.getMovies] Error:', error.message);
            return { movies: { data: [] } };
        }
    },

    getAnimeShow: async (animeId) => {
        const response = await api.get(`/api/react/anime/${animeId}`);
        const anime = response.data.anime;
        return {
            series: anime,
            episodes: anime?.episodes || [],
        };
    },

    getEpisodeShow: async (episodeId) => {
        const response = await api.get(`/api/react/episodes/${episodeId}`);
        return response.data;
    },
};

export const userService = {
    getNotifications: async (page = 1) => {
        const response = await api.get('/api/react/notifications', { params: { page } });
        return response.data;
    },

    markNotificationsRead: async () => {
        const response = await api.post('/api/react/notifications/mark-read');
        return response.data;
    },

    getWatchLater: async (page = 1) => {
        const response = await api.get('/api/react/watch-later', { params: { page } });
        return response.data;
    },

    addWatchLater: async (episodeId) => {
        const response = await api.post(`/api/react/watch-later/${episodeId}`);
        return response.data;
    },

    removeWatchLater: async (episodeId) => {
        const response = await api.delete(`/api/react/watch-later/${episodeId}`);
        return response.data;
    },

    getHistory: async (page = 1) => {
        const response = await api.get('/api/react/history', { params: { page } });
        return response.data;
    },

    addComment: async (episodeId, content, parentId = null) => {
        const response = await api.post('/api/react/comments', {
            episode_id: episodeId,
            content,
            parent_id: parentId,
        });
        return response.data;
    },

    likeComment: async (commentId, isLike) => {
        const response = await api.post(`/api/react/comments/${commentId}/like`, {
            is_like: isLike,
        });
        return response.data;
    },

    editComment: async (commentId, content) => {
        const response = await api.put(`/api/react/comments/${commentId}`, {
            content,
        });
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await api.delete(`/api/react/comments/${commentId}`);
        return response.data;
    },
};

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/api/react/login', { email, password });
        if (response.data.token) {
            await AsyncStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    register: async (name, email, password, password_confirmation) => {
        const response = await api.post('/api/react/register', {
            name, email, password, password_confirmation
        });
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('auth_token');
        const response = await api.post('/api/react/logout');
        return response.data;
    },

    getUser: async () => {
        const response = await api.get('/api/react/user');
        return response.data;
    },
};

export default api;
