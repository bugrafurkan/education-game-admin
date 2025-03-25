// src/hooks/useQuestions.ts
import { useState, useEffect } from 'react';
import { getQuestions } from '../services/question.service';
import axios, { AxiosError } from 'axios';

// API yanıt tipini tanımlama
interface Question {
    id: number;
    question_text: string;
    question_type: string;
    difficulty: string;
    category_id: number;
    image_path?: string;
    answers: Array<{
        id: number;
        answer_text: string;
        is_correct: boolean;
    }>;
    [key: string]: unknown;
    category?: {
        id: number;
        name: string;
        grade?: string;
        subject?: string;
        unit?: string;
    };
}

interface PaginationData {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
}

interface ApiResponse {
    data: Question[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

// Filter tipini tanımlayın
interface QuestionFilters {
    search?: string;
    type?: string;
    difficulty?: string;
    category_id?: number;
    [key: string]: unknown;
}

// API hatası için tip tanımı
interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export const useQuestions = (page = 1, filters: QuestionFilters = {}) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        perPage: 10,
        currentPage: 1,
        lastPage: 1
    });

    const fetchQuestions = async (pageNum: number, queryFilters: QuestionFilters) => {
        try {
            setLoading(true);
            const response = await getQuestions(pageNum, queryFilters) as ApiResponse;
            setQuestions(response.data);
            setPagination({
                total: response.total,
                perPage: response.per_page,
                currentPage: response.current_page,
                lastPage: response.last_page
            });
            setLoading(false);
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? (err as AxiosError<ApiError>).response?.data?.message || 'Sorular yüklenirken hata oluştu'
                : 'Sorular yüklenirken hata oluştu';

            setError(errorMessage);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions(page, filters);
    }, [page, filters]);

    return {
        questions,
        loading,
        error,
        pagination,
        refresh: () => fetchQuestions(page, filters)
    };
};