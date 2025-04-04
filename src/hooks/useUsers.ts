// src/hooks/useUsers.ts
import { useEffect, useState } from 'react';
import * as userService from '../services/user.service';

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
}

export const useUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (err) {
            setError('Kullanıcılar alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const getUserById = async (id: number) => {
        try {
            return await userService.getUser(id);
        } catch {
            setError('Kullanıcı bilgisi alınamadı.');
            return null;
        }
    };

    const updateUser = async (id: number, formData: UserFormData) => {
        return await userService.updateUser(id, formData);
    };

    const removeUser = async (id: number) => {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers,
        getUserById,
        updateUser,
        removeUser,
    };
};
