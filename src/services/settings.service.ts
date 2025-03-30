// src/services/settings.service.ts
import api from './api';

export interface GeneralSettings {
    app_name: string;
    logo_url: string;
    theme_color: string;
}

export interface AdvertisementSettings {
    ads_enabled: boolean;
    ad_type: 'image' | 'video';
    ad_file?: File; // Dosya yükleme durumunda kullanılacak
    ad_file_url?: string; // API'den gelecek, kaydedilmiş dosya yolu
}

export interface Settings {
    general: GeneralSettings;
    advertisements: AdvertisementSettings;
}

// Tüm ayarları getir
export const getSettings = async (): Promise<Settings> => {
    const response = await api.get<Settings>('/settings');
    return response.data;
};

// Ayarları güncelle
export const updateSettings = async (settingsData: Partial<Settings>): Promise<Settings> => {
    // Eğer dosya içeriyorsa FormData kullan
    if (settingsData.advertisements?.ad_file) {
        const formData = new FormData();

        // Genel ayarları ekle
        if (settingsData.general) {
            formData.append('app_name', settingsData.general.app_name);
            formData.append('logo_url', settingsData.general.logo_url);
            formData.append('theme_color', settingsData.general.theme_color);
        }

        // Advertisement ayarları ekle
        if (settingsData.advertisements) {
            formData.append('ads_enabled', String(settingsData.advertisements.ads_enabled));
            formData.append('ad_type', settingsData.advertisements.ad_type);

            // Dosyayı ekle
            formData.append('ad_file', settingsData.advertisements.ad_file);
        }

        const response = await api.post<Settings>('/settings/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } else {
        // Dosya yoksa normal JSON formatında gönder
        const response = await api.put<Settings>('/settings', settingsData);
        return response.data;
    }
};