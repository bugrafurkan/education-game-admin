// src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, logout as logoutService } from '../services/auth.service';
import axios, { AxiosError } from 'axios';

// API yanıt hatası için tip tanımı
interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await loginService(email, password);
            setLoading(false);
            navigate('/');
            return data;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? (err as AxiosError<ApiError>).response?.data?.message || 'Giriş başarısız'
                : 'Giriş başarısız';

            setError(errorMessage);
            setLoading(false);
            throw err;
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logoutService();
            setLoading(false);
            navigate('/login');
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? (err as AxiosError<ApiError>).response?.data?.message || 'Çıkış başarısız'
                : 'Çıkış başarısız';

            setError(errorMessage);
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!sessionStorage.getItem('auth_token')
    };
};