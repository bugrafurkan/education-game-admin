// src/services/auth.service.ts
import api from './api';

export const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });

    // Token'ı oturuma kaydet
    if (response.data.token) {
        sessionStorage.setItem('auth_token', response.data.token);
    }

    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/logout');
    } catch (error) {
        console.error('Logout error', error);
    } finally {
        // Her durumda token'ı temizle
        sessionStorage.removeItem('auth_token');
    }
};

export const getCurrentUser = async () => {
    const response = await api.get('/user');
    return response.data;
};