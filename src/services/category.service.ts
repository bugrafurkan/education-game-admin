// src/services/category.service.ts
import api from './api';


export interface Category {
    id: number;
    name: string;
    grade: string;
    subject: string;
    unit?: string;
    description?: string;
}

export interface CategoryCreate {
    name: string;
    grade: string;
    subject: string;
    unit?: string;
    description?: string;
}

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

// Tek bir kategoriyi getir
export const getCategory = async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
};

// Yeni kategori oluştur
export const createCategory = async (categoryData: CategoryCreate): Promise<Category> => {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
};

// Kategoriyi güncelle
export const updateCategory = async (id: number, categoryData: Partial<CategoryCreate>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
};

// Kategoriyi sil
export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
};

// Sınıf ve ders bazında filtreleme
export const filterCategories = async (grade?: string, subject?: string): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/categories/filter/${grade || ''}/${subject || ''}`);
    return response.data;
};