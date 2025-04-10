// src/services/question-group.service.ts
import api from './api';

export interface QuestionGroup {
    id: number;
    name: string;
    code: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    game_id: number;
    created_by: number;
    questions_count: number;
    created_at: string;
    updated_at: string;
    image_url?: string; // Etkinlik görseli için URL eklendi
    game?: {
        id: number;
        name: string;
        type: string;
    };
    creator?: {
        id: number;
        name: string;
        email: string;
    };
    questions?: Question[];
}

export interface Question {
    id: number;
    category_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    difficulty: 'easy' | 'medium' | 'hard';
    image_path?: string;
    user_id?: number;
    category?: {
        id: number;
        name: string;
    };
    answers?: Answer[];
    pivot?: {
        order: number;
    };
}

export interface Answer {
    id: number;
    question_id: number;
    answer_text: string;
    is_correct: boolean;
    image_path?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface QuestionGroupCreate {
    name: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    game_id: number;
    question_ids: number[];
}

export interface QuestionGroupUpdate {
    name?: string;
    question_ids?: number[];
}

export interface EligibleQuestionsParams {
    game_id: number;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    page?: number;
}

// Tüm soru gruplarını getir
export const getQuestionGroups = async (page = 1): Promise<PaginatedResponse<QuestionGroup>> => {
    const response = await api.get<PaginatedResponse<QuestionGroup>>('/question-groups', {
        params: { page }
    });
    return response.data;
};

// Belirli bir soru grubunu getir
export const getQuestionGroup = async (id: number): Promise<QuestionGroup> => {
    const response = await api.get<QuestionGroup>(`/question-groups/${id}`);
    return response.data;
};

// Kod ile soru grubunu getir
export const getQuestionGroupByCode = async (code: string): Promise<QuestionGroup> => {
    const response = await api.get<QuestionGroup>(`/question-groups/code/${code}`);
    return response.data;
};

// Yeni soru grubu oluştur
export const createQuestionGroup = async (groupData: QuestionGroupCreate): Promise<QuestionGroup> => {
    const response = await api.post<QuestionGroup>('/question-groups', groupData);
    return response.data;
};

// Görsel ile yeni soru grubu oluştur (FormData kullanır)
export const createQuestionGroupWithImage = async (formData: FormData): Promise<QuestionGroup> => {
    const response = await api.post<QuestionGroup>('/question-groups', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Soru grubunu güncelle
export const updateQuestionGroup = async (id: number, groupData: QuestionGroupUpdate): Promise<QuestionGroup> => {
    const response = await api.put<QuestionGroup>(`/question-groups/${id}`, groupData);
    return response.data;
};

// Görsel ile soru grubunu güncelle (FormData kullanır)
export const updateQuestionGroupWithImage = async (id: number, formData: FormData): Promise<QuestionGroup> => {
    const response = await api.post<QuestionGroup>(`/question-groups/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Soru grubunu sil
export const deleteQuestionGroup = async (id: number): Promise<void> => {
    await api.delete(`/question-groups/${id}`);
};

// Uygun soruları getir (grup oluşturma için)
export const getEligibleQuestions = async (params: EligibleQuestionsParams): Promise<PaginatedResponse<Question>> => {
    const response = await api.get<PaginatedResponse<Question>>('/eligible-questions', { params });
    return response.data;
};