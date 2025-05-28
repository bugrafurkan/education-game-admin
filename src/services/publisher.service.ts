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

// Tüm publisher'ları getir (autocomplete için)
export const getPublishers = async (): Promise<Publisher[]> => {
    try {
        const response = await api.get<Publisher[]>(`/publishers`);
        return response.data;
    } catch (error) {
        console.error('Publisher listesi alınırken hata:', error);
        throw error;
    }
};

// İsme göre publisher bul veya oluştur
export const findOrCreatePublisher = async (name: string): Promise<Publisher> => {
    try {
        const response = await api.post<Publisher>(`/publishers/find-or-create`, {
            name: name.trim()
        });
        return response.data;
    } catch (error) {
        console.error('Publisher oluşturulurken/bulunurken hata:', error);
        throw error;
    }
};