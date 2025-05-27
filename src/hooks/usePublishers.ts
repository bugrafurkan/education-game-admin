// src/hooks/usePublishers.ts - Yeni dosya oluştur
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Publisher {
    publisher: string;
    count: number; // Kaç kullanıcı bu yayınevinden
}

export const usePublishers = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublishers = async () => {
            try {
                setLoading(true);
                const response = await api.get<Publisher[]>('/publishers');
                setPublishers(response.data);
            } catch (err) {
                setError('Yayınevleri yüklenirken hata oluştu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublishers();
    }, []);

    return { publishers, loading, error };
};