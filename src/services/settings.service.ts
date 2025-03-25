// src/services/settings.service.ts
import api from './api';

interface GeneralSettings {
    app_name: string;
    logo_url: string;
    theme_color: string;
}

interface FernusSettings {
    fernus_enabled: boolean;
    fernus_api_key: string;
    fernus_api_url: string;
}

interface AdvertisementSettings {
    ads_enabled: boolean;
    default_banner: string;
}

interface Settings {
    general: GeneralSettings;
    fernus: FernusSettings;
    advertisements: AdvertisementSettings;
}

// Tüm ayarları getir
export const getSettings = async (): Promise<Settings> => {
    const response = await api.get<Settings>('/settings');
    return response.data;
};

// Ayarları güncelle
export const updateSettings = async (settingsData: Partial<Settings>): Promise<Settings> => {
    const response = await api.put<Settings>('/settings', settingsData);
    return response.data;
};