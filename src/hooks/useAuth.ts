// src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            setLoading(false);
            const role = data.user?.role;

            if (role === 'editor') {
                navigate('/user-management');
            } else {
                navigate('/');
            }
            return data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Giriş başarısız';
            setError(errorMessage);
            setLoading(false);
            throw err;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setLoading(false);
            navigate('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Çıkış başarısız';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return {
        login,
        logout,
        loading,
        error,
        isAuthenticated: authService.isAuthenticated()
    };
};