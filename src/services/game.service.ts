// src/services/game.service.ts
import api from './api';

export interface Game {
    id: number;
    name: string;
    type: 'jeopardy' | 'wheel';
    description?: string;
    config?: Record<string, unknown>;
    created_by: number;
    is_active: boolean;
    questions?: Question[];
}

export interface Question {
    id: number;
    question_text: string;
    question_type: string;
    pivot?: {
        points: number;
        order?: number;
        category_label?: string;
        special_effects?: string;
    };
}

export interface GameCreate {
    name: string;
    type: 'jeopardy' | 'wheel';
    description?: string;
    config?: Record<string, unknown>;
    is_active?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface AddQuestionData {
    question_id: number;
    points: number;
    order?: number;
    category_label?: string;
    special_effects?: string;
}

export interface IframeResponse {
    iframe_code: string;
    game_url: string;
}

// Tüm oyunları getir
export const getGames = async (page = 1): Promise<PaginatedResponse<Game>> => {
    const response = await api.get<PaginatedResponse<Game>>('/games', { params: { page } });
    return response.data;
};

// Tek bir oyunu getir
export const getGame = async (id: number): Promise<Game> => {
    const response = await api.get<Game>(`/games/${id}`);
    return response.data;
};

// Yeni oyun oluştur
export const createGame = async (gameData: GameCreate): Promise<Game> => {
    const response = await api.post<Game>('/games', gameData);
    return response.data;
};

// Oyunu güncelle
export const updateGame = async (id: number, gameData: Partial<GameCreate>): Promise<Game> => {
    const response = await api.put<Game>(`/games/${id}`, gameData);
    return response.data;
};

// Oyunu sil
export const deleteGame = async (id: number): Promise<void> => {
    await api.delete(`/games/${id}`);
};

// Oyuna soru ekle
export const addQuestionToGame = async (gameId: number, questionData: AddQuestionData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/games/${gameId}/add-question`, questionData);
    return response.data;
};

// Oyundan soru çıkar
export const removeQuestionFromGame = async (gameId: number, questionId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/games/${gameId}/remove-question/${questionId}`);
    return response.data;
};

// Oyun konfigürasyonunu al
export const getGameConfig = async (gameId: number): Promise<Record<string, unknown>> => {
    const response = await api.get<Record<string, unknown>>(`/games/${gameId}/config`);
    return response.data;
};

// iframe kodu al
export const getGameIframeCode = async (gameId: number): Promise<IframeResponse> => {
    const response = await api.get<IframeResponse>(`/games/${gameId}/iframe`);
    return response.data;
};