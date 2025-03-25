// src/hooks/useGames.ts
import { useState, useEffect } from 'react';
import { getGames, Game } from '../services/game.service';
import axios, { AxiosError } from 'axios';

interface PaginationData {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
}

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export const useGames = (page = 1) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        perPage: 10,
        currentPage: 1,
        lastPage: 1
    });

    // fetchGames fonksiyonunu useEffect dışına çıkardık
    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await getGames(page);
            setGames(response.data);
            setPagination({
                total: response.total,
                perPage: response.per_page,
                currentPage: response.current_page,
                lastPage: response.last_page
            });
            setLoading(false);
        } catch (error) {
            // Axios hatalarını daha spesifik işleyelim
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiError>;
                setError(axiosError.response?.data?.message || 'Oyunlar yüklenirken bir hata oluştu.');
            } else {
                setError('Oyunlar yüklenirken beklenmeyen bir hata oluştu.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, [page]);

    return {
        games,
        loading,
        error,
        pagination,
        refresh: fetchGames  // Artık doğrudan fonksiyonu referans edebiliriz
    };
};