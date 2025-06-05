// src/services/publisher.service.ts
import api from './api';

export interface Publisher {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface PublisherCreate {
    name: string;
}

export interface PublisherUpdate {
    name: string;
}

export interface ApiResponse<T> {
    message: string;
    data: T;
}

// Tüm publisher'ları getir
export const getPublishers = async (): Promise<Publisher[]> => {
    const response = await api.get('/publishers');
    return response.data;
};

// Publisher oluştur
export const createPublisher = async (data: PublisherCreate): Promise<Publisher> => {
    const response = await api.post<ApiResponse<Publisher>>('/publishers', data);
    return response.data.data;
};

// Publisher güncelle
export const updatePublisher = async (id: number, data: PublisherUpdate): Promise<Publisher> => {
    const response = await api.put<ApiResponse<Publisher>>(`/publishers/${id}`, data);
    return response.data.data;
};

// Publisher sil
export const deletePublisher = async (id: number): Promise<void> => {
    await api.delete(`/publishers/${id}`);
};

// İsme göre publisher bul veya oluştur
export const findOrCreatePublisher = async (name: string): Promise<Publisher> => {
    const response = await api.post<Publisher>('/publishers/find-or-create', { name });
    return response.data;
};

// Belirli publisher'ı getir
export const getPublisher = async (id: number): Promise<Publisher> => {
    const response = await api.get<Publisher>(`/publishers/${id}`);
    return response.data;
};