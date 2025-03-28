// src/hooks/useGame.ts
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import * as gameService from '../services/game.service';
import { Game, GameQuestionAdd, IframeCodeResponse } from '../services/game.service';

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const useGame = (id: number) => {
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [iframeCode, setIframeCode] = useState<string | null>(null);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [iframeError, setIframeError] = useState<string | null>(null);

    const fetchGame = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await gameService.getGame(id);
            setGame(data);
            setLoading(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Oyun bilgileri yüklenirken bir hata oluştu');
                console.error('Error fetching game:', axiosError.response?.data);
            } else {
                setError('Oyun bilgileri yüklenirken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGame();
    }, [id]);

    // Soruyu oyundan çıkar
    const removeQuestion = async (questionId: number): Promise<boolean> => {
        if (!game) return false;

        try {
            setLoading(true);
            await gameService.removeQuestionFromGame(game.id, questionId);
            await fetchGame(); // Oyun bilgilerini yenile
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Soru oyundan çıkarılırken bir hata oluştu');
                console.error('Error removing question:', axiosError.response?.data);
            } else {
                setError('Soru oyundan çıkarılırken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
            setLoading(false);
            return false;
        }
    };

    // Oyuna soru ekle
    const addQuestion = async (questionData: GameQuestionAdd): Promise<boolean> => {
        if (!game) return false;

        try {
            setLoading(true);
            await gameService.addQuestionToGame(game.id, questionData);
            await fetchGame(); // Oyun bilgilerini yenile
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Soru oyuna eklenirken bir hata oluştu');
                console.error('Error adding question:', axiosError.response?.data);
            } else {
                setError('Soru oyuna eklenirken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
            setLoading(false);
            return false;
        }
    };

    // iframe kodunu al
    const getIframeCode = async (): Promise<IframeCodeResponse | null> => {
        if (!game) return null;

        try {
            setIframeLoading(true);
            setIframeError(null);
            const response = await gameService.getIframeCode(game.id);
            setIframeCode(response.iframe_code);
            setIframeLoading(false);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setIframeError(axiosError.response?.data?.message || 'iframe kodu alınırken bir hata oluştu');
                console.error('Error getting iframe code:', axiosError.response?.data);
            } else {
                setIframeError('iframe kodu alınırken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
            setIframeLoading(false);
            return null;
        }
    };

    return {
        game,
        loading,
        error,
        iframeCode,
        iframeLoading,
        iframeError,
        refresh: fetchGame,
        removeQuestion,
        addQuestion,
        getIframeCode
    };
};