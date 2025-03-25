// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { getDashboardStats, DashboardStats } from '../services/dashboard.service';
import axios, { AxiosError } from 'axios';

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
                setLoading(false);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<ApiError>;
                    setError(axiosError.response?.data?.message || 'Dashboard bilgileri yüklenirken bir hata oluştu.');
                } else {
                    setError('Dashboard bilgileri yüklenirken beklenmeyen bir hata oluştu.');
                }
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};