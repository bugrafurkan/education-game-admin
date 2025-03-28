// src/services/export.service.ts
import api from './api';

interface Export {
    id: number;
    game_id: number;
    version: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    download_url?: string;
    uploaded_to_fernus: boolean;
    fernus_url?: string;
    created_by: number;
    config_snapshot?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface ExportCreate {
    game_id: number;
    notes?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface FernusUploadResponse {
    message: string;
    fernus_url: string;
}

// Tüm exportları getir
export const getExports = async (page = 1): Promise<PaginatedResponse<Export>> => {
    const response = await api.get<PaginatedResponse<Export>>('/exports', { params: { page } });
    return response.data;
};

// Yeni export oluştur
export const createExport = async (exportData: ExportCreate): Promise<Export> => {
    const response = await api.post<Export>('/exports', exportData);
    return response.data;
};

// Export detaylarını getir
export const getExport = async (id: number): Promise<Export> => {
    const response = await api.get<Export>(`/exports/${id}`);
    return response.data;
};

// Fernus'a yükle
export const uploadToFernus = async (exportId: number): Promise<FernusUploadResponse> => {
    const response = await api.post<FernusUploadResponse>(`/exports/${exportId}/upload-to-fernus`);
    return response.data;
};

// Export dosyasını indir (doğrudan indirme linki döner)
export const getExportDownloadUrl = (exportId: number): string => {
    return `${api.defaults.baseURL}/exports/${exportId}/download`;
};