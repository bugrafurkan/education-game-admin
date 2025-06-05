// src/hooks/usePublishers.ts
import { useState, useEffect, useCallback } from 'react';
import * as publisherService from '../services/publisher.service';

export const usePublishers = () => {
    const [publishers, setPublishers] = useState<publisherService.Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Publisher'ları yükle
    const fetchPublishers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await publisherService.getPublishers();
            setPublishers(data);
        } catch (err) {
            console.error('Publishers yüklenirken hata:', err);
            setError('Publisher\'lar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    // Yeni publisher oluştur
    const createPublisher = useCallback(async (name: string): Promise<publisherService.Publisher> => {
        try {
            const newPublisher = await publisherService.createPublisher({ name });
            setPublishers(prev => [...prev, newPublisher].sort((a, b) => a.name.localeCompare(b.name)));
            return newPublisher;
        } catch (err) {
            console.error('Publisher oluşturulurken hata:', err);
            throw err;
        }
    }, []);

    // Publisher güncelle
    const updatePublisher = useCallback(async (id: number, name: string): Promise<publisherService.Publisher> => {
        try {
            const updatedPublisher = await publisherService.updatePublisher(id, { name });
            setPublishers(prev =>
                prev.map(p => p.id === id ? updatedPublisher : p)
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            return updatedPublisher;
        } catch (err) {
            console.error('Publisher güncellenirken hata:', err);
            throw err;
        }
    }, []);

    // Publisher sil
    const deletePublisher = useCallback(async (id: number): Promise<void> => {
        try {
            await publisherService.deletePublisher(id);
            setPublishers(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Publisher silinirken hata:', err);
            throw err;
        }
    }, []);

    // İsme göre publisher bul veya oluştur
    const findOrCreatePublisher = useCallback(async (name: string): Promise<publisherService.Publisher> => {
        try {
            const publisher = await publisherService.findOrCreatePublisher(name);

            // Eğer yeni oluşturulduysa listeye ekle
            setPublishers(prev => {
                const exists = prev.some(p => p.id === publisher.id);
                if (!exists) {
                    return [...prev, publisher].sort((a, b) => a.name.localeCompare(b.name));
                }
                return prev;
            });

            return publisher;
        } catch (err) {
            console.error('Publisher bulunurken/oluşturulurken hata:', err);
            throw err;
        }
    }, []);

    // Manuel yenileme
    const refreshPublishers = useCallback(async () => {
        await fetchPublishers();
    }, [fetchPublishers]);

    // Component mount olduğunda publisher'ları yükle
    useEffect(() => {
        fetchPublishers();
    }, [fetchPublishers]);

    return {
        publishers,
        loading,
        error,
        createPublisher,
        updatePublisher,
        deletePublisher,
        findOrCreatePublisher,
        refreshPublishers,
        fetchPublishers
    };
};