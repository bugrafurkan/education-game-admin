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
    grade?: string;
    subject?: string;
}

// Tüm reklamları getir
export const getAdvertisements = async (): Promise<Advertisement[]> => {
    const response = await api.get<Advertisement[]>('/advertisements');
    return response.data;
};

// Yeni reklam ekle
export const createAdvertisement = async (
    name: string,
    type: 'image' | 'video',
    file: File,
    grade?: string,
    subject?: string
): Promise<Advertisement> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('file', file);
    if (grade) formData.append('grade', grade);
    if (subject) formData.append('subject', subject);

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
    data: { name?: string; is_active?: boolean }
): Promise<Advertisement> => {
    const response = await api.put<Advertisement>(`/advertisements/${id}`, data);
    return response.data;
};

// Reklamı sil
export const deleteAdvertisement = async (id: number): Promise<void> => {
    await api.delete(`/advertisements/${id}`);
};