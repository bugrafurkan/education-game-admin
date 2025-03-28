// src/services/category.service.ts
import api from './api';
import { Category } from './question.service';

// Tüm kategorileri getir
export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

// Belirli filtrelerle kategorileri getir
export const getCategoriesByFilter = async (grade?: string, subject?: string): Promise<Category[]> => {
    const url = grade && subject
        ? `/categories/filter/${grade}/${subject}`
        : grade
            ? `/categories/filter/${grade}`
            : '/categories';

    const response = await api.get<Category[]>(url);
    return response.data;
};

// Yeni kategori oluştur
export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
};

// Kategoriyi güncelle
export const updateCategory = async (id: number, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
};

// Kategoriyi sil
export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
};