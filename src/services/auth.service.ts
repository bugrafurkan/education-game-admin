// src/services/auth.service.ts
import api from './api';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface LogoutResponse {
    message: string;
}

interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password });

    // Token'ı oturuma kaydet
    if (response.data.token) {
        sessionStorage.setItem('auth_token', response.data.token);
    }

    return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
    try {
        const response = await api.post<LogoutResponse>('/logout');
        return response.data;
    } catch (error) {
        console.error('Logout error', error);
        throw error;
    } finally {
        // Her durumda token'ı temizle
        sessionStorage.removeItem('auth_token');
    }
};

export const getCurrentUser = async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/user');
    return response.data;
};