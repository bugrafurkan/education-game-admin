// src/services/auth.service.ts
import api from './api';

export interface LoginResponse {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    token: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password });

    // Token'ı oturumda sakla
    if (response.data.token) {
        sessionStorage.setItem('auth_token', response.data.token);
    }

    return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/logout');
        // Her durumda token'ı temizle
        sessionStorage.removeItem('auth_token');
        return response.data;
    } catch (error) {
        sessionStorage.removeItem('auth_token');
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>('/user');
    return response.data;
};

// Kullanıcının giriş yapmış olup olmadığını kontrol et
export const isAuthenticated = (): boolean => {
    return !!sessionStorage.getItem('auth_token');
};