// src/hooks/usePublishers.ts
import { useState, useEffect } from 'react';
import * as publisherService from '../services/publisher.service';

export interface Publisher {
    id: number;
    name: string;
}

export const usePublishers = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublishers = async () => {
        try {
            setLoading(true);
            setError(null);
            const publisherList = await publisherService.getPublishers();
            setPublishers(publisherList);
        } catch (err) {
            setError('Publisher listesi yüklenirken bir hata oluştu');
            console.error('Publisher fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const findOrCreatePublisher = async (name: string): Promise<Publisher | null> => {
        try {
            setError(null);
            const publisher = await publisherService.findOrCreatePublisher(name);

            // Listeyi güncelle (eğer yeni ise)
            if (!publishers.find(p => p.id === publisher.id)) {
                setPublishers(prev => [...prev, publisher].sort((a, b) => a.name.localeCompare(b.name)));
            }

            return publisher;
        } catch (err) {
            setError('Publisher işlemi sırasında bir hata oluştu');
            console.error('Publisher find/create error:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchPublishers();
    }, []);

    return {
        publishers,
        loading,
        error,
        fetchPublishers,
        findOrCreatePublisher
    };
};