// src/services/question.service.ts
import api from './api';

export interface Category {
    id: number;
    name: string;
    grade: string;
    subject: string;
    unit?: string;
}

export interface Answer {
    id?: number;
    answer_text: string;
    is_correct: boolean;
    image_path?: string;
}

export interface Question {
    id: number;
    category_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    difficulty: 'easy' | 'medium' | 'hard';
    image_path?: string;
    metadata?: Record<string, unknown>;
    answers: Answer[];
    category?: Category;
}

export interface QuestionCreate {
    category_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    difficulty: 'easy' | 'medium' | 'hard';
    image_path?: string;
    metadata?: Record<string, unknown>;
    answers: Omit<Answer, 'id'>[];
}

export interface QuestionFilter {
    search?: string;
    type?: string;
    difficulty?: string;
    category_id?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

// Tüm soruları getir (filtreleme ve sayfalama ile)
export const getQuestions = async (page = 1, filters: QuestionFilter = {}): Promise<PaginatedResponse<Question>> => {
    const response = await api.get<PaginatedResponse<Question>>('/questions', {
        params: { page, ...filters }
    });
    return response.data;
};

// Tek bir soruyu getir
export const getQuestion = async (id: number): Promise<Question> => {
    const response = await api.get<Question>(`/questions/${id}`);
    return response.data;
};

// Yeni soru oluştur
export const createQuestion = async (questionData: QuestionCreate): Promise<Question> => {
    const response = await api.post<Question>('/questions', questionData);
    return response.data;
};

// Soruyu güncelle
export const updateQuestion = async (id: number, questionData: Partial<QuestionCreate>): Promise<Question> => {
    const response = await api.put<Question>(`/questions/${id}`, questionData);
    return response.data;
};

// Soruyu sil
export const deleteQuestion = async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
};

// Resim yükleme
export const uploadImage = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ url: string }>('/questions/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};