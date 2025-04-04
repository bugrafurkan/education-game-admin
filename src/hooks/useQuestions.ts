// src/hooks/useQuestions.ts
import { useState, useEffect, useCallback } from 'react';
import * as questionService from '../services/question.service';

interface UseQuestionsReturn {
    questions: questionService.Question[];
    loading: boolean;
    error: string | null;
    deleteQuestion: (id: number) => Promise<boolean>;
    refreshQuestions: () => Promise<void>;
    pagination: questionService.PaginatedResponse<questionService.Question> | null;
    fetchPage: (pageNumber: number) => Promise<void>;
}

export const useQuestions = (
    initialPage: number = 1,
    filters: questionService.QuestionFilter = {}
): UseQuestionsReturn => {
    const [questions, setQuestions] = useState<questionService.Question[]>([]);
    const [pagination, setPagination] = useState<questionService.PaginatedResponse<questionService.Question> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Belirli bir sayfayı getiren fonksiyon
    const fetchPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            setCurrentPage(page);

            // Sayfa başına makul bir miktar soru getir (örn. 10 veya 20)
            const response = await questionService.getQuestions(page, { ...filters, per_page: 20 });

            setQuestions(response.data);
            setPagination(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError('Sorular yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // İlk yüklemede ve filtreler değiştiğinde ilk sayfayı getir
    useEffect(() => {
        fetchPage(initialPage);
    }, [fetchPage, initialPage]);

    // Soru silme işlemi
    const deleteQuestion = async (id: number): Promise<boolean> => {
        try {
            setLoading(true);
            await questionService.deleteQuestion(id);

            // Silme başarılıysa mevcut sayfayı yeniden yükle
            await fetchPage(currentPage);

            return true;
        } catch (err) {
            console.error('Error deleting question:', err);
            setError('Soru silinirken bir hata oluştu.');
            setLoading(false);
            return false;
        }
    };

    return {
        questions,
        loading,
        error,
        deleteQuestion,
        refreshQuestions: () => fetchPage(currentPage),
        pagination,
        fetchPage
    };
};