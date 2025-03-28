// src/services/api.ts
import axios from 'axios';

// API temel URL'si - .env dosyasından alınabilir
const API_URL = 'http://localhost:8000/api';

// axios örneğini oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// İstek gönderilmeden önce çalışacak interceptor - token ekleme
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Yanıt geldiğinde çalışacak interceptor - hata işleme
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // 401 Unauthorized hatası - token süresi dolmuş veya geçersiz
        if (error.response?.status === 401) {
            sessionStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;