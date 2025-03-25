// src/services/api.ts
import axios from 'axios';

// Backend API URL'si (Laravel API'nize göre değiştir)
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - her istekte token ekleme
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - hata yakalama ve token süresi bitme durumu
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token süresi bitti veya geçersiz
            sessionStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;