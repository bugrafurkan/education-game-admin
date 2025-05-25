// src/services/advertisement.service.ts
import api from './api';

export interface Advertisement {
    id: number;
    name: string;
    type: 'image' | 'video';
    file_path: string;
    file_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_date: string;
    end_date: string | null;
    grade?: string;
    subject?: string;
    duration?: number;
}

// Tüm reklamları getir
export const getAdvertisements = async (): Promise<Advertisement[]> => {
    const response = await api.get<Advertisement[]>('/advertisements');
    return response.data;
};

// Yeni reklam ekle
export const createAdvertisement = async (
    name: string,
    type: "image" | "video",
    file: File,
    start_date: string,
    end_date?: string | null,
    duration?: number | null,
    grade?: string | undefined,
    subject?: string | undefined

): Promise<Advertisement> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('file', file);
    formData.append('start_date', start_date);
    if (end_date) formData.append('end_date', end_date);
    if (grade !== null && grade !== undefined) {
        formData.append('grade', grade.toString());
    }
    if (subject) formData.append('subject', subject);
    if (duration !== undefined && duration !== null) {
        formData.append('duration', duration.toString());
    }

    const response = await api.post<Advertisement>('/advertisements', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

// Reklam detaylarını getir
export const getAdvertisement = async (id: number): Promise<Advertisement> => {
    const response = await api.get<Advertisement>(`/advertisements/${id}`);
    return response.data;
};

// Reklam bilgilerini güncelle
export const updateAdvertisement = async (
    id: number,
    data: {
        name?: string;
        is_active?: boolean;
        grade?: string;
        subject?: string;
        start_date?: string;
        end_date?: string | null;
        duration?: number;
    }
): Promise<Advertisement> => {
    const response = await api.put<Advertisement>(`/advertisements/${id}`, data);
    return response.data;
};

// Reklamı sil
export const deleteAdvertisement = async (id: number): Promise<void> => {
    await api.delete(`/advertisements/${id}`);
};