// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import * as categoryService from '../services/category.service';
import { Category } from '../services/question.service';

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const useCategories = (grade?: string, subject?: string) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoryService.getCategoriesByFilter(grade, subject);
            setCategories(data);
            setLoading(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Kategoriler yüklenirken bir hata oluştu');
                console.error('Error fetching categories:', axiosError.response?.data);
            } else {
                setError('Kategoriler yüklenirken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [grade, subject]);

    return {
        categories,
        loading,
        error,
        refresh: fetchCategories
    };
};