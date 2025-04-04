// src/hooks/useAdvertisements.ts
import { useState, useEffect, useCallback } from 'react';
import {
    Advertisement,
    getAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
} from '../services/advertisement.service';

interface UseAdvertisementsReturn {
    advertisements: Advertisement[];
    loading: boolean;
    error: Error | null;
    refreshAdvertisements: () => Promise<void>;
    addAdvertisement: (name: string, type: 'image' | 'video', file: File, grade: string, subject:string) => Promise<boolean>;
    toggleAdvertisementStatus: (id: number, isActive: boolean) => Promise<boolean>;
    removeAdvertisement: (id: number) => Promise<boolean>;
    isSubmitting: boolean;
}

export const useAdvertisements = (): UseAdvertisementsReturn => {
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Reklamları getir
    const fetchAdvertisements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdvertisements();
            setAdvertisements(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Reklamlar yüklenirken bir hata oluştu'));
        } finally {
            setLoading(false);
        }
    }, []);

    // Bileşen ilk kez render edildiğinde reklamları getir
    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    // Yeni reklam ekle
    const addAdvertisement = async (
        name: string,
        type: 'image' | 'video',
        file: File,
        grade?: string,
        subject?: string
    ): Promise<boolean> => {
        setIsSubmitting(true);
        try {
            const newAd = await createAdvertisement(name, type, file, grade, subject);
            setAdvertisements((prevAds) => [newAd, ...prevAds]);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Reklam eklenirken bir hata oluştu'));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };


    // Reklam durumunu değiştir (aktif/pasif)
    const toggleAdvertisementStatus = async (id: number, isActive: boolean): Promise<boolean> => {
        try {
            const updatedAd = await updateAdvertisement(id, { is_active: isActive });
            setAdvertisements((prevAds) =>
                prevAds.map((ad) => (ad.id === id ? updatedAd : ad))
            );
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Reklam durumu güncellenirken bir hata oluştu'));
            return false;
        }
    };

    // Reklam sil
    const removeAdvertisement = async (id: number): Promise<boolean> => {
        try {
            await deleteAdvertisement(id);
            setAdvertisements((prevAds) => prevAds.filter((ad) => ad.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Reklam silinirken bir hata oluştu'));
            return false;
        }
    };

    return {
        advertisements,
        loading,
        error,
        refreshAdvertisements: fetchAdvertisements,
        addAdvertisement,
        toggleAdvertisementStatus,
        removeAdvertisement,
        isSubmitting,
    };
};