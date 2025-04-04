import { useEffect, useState } from 'react';
import * as userService from '../services/user.service';

export const useUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (err: any) {
            setError('Kullanıcılar alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const removeUser = async (id: number) => {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, removeUser };
};
