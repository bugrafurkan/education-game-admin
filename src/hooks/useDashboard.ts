// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { getDashboardStats, DashboardStats } from '../services/dashboard.service';

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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Dashboard bilgileri yüklenirken bir hata oluştu.');
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};