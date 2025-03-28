// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { FC, ReactElement } from 'react';
import Layout from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import QuestionList from '../pages/questions/QuestionList';
import AddQuestion from '../pages/questions/AddQuestion';
import GameList from '../pages/games/GameList';
import GameDetail from '../pages/games/GameDetail';
import ExportList from '../pages/exports/ExportList';
import CreateExport from '../pages/exports/CreateExport';
import Settings from '../pages/settings/Settings'

// AuthGuard: Kimlik doğrulama gerektiren rotalar için koruma
interface AuthGuardProps {
    children: ReactElement;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
    const isAuthenticated = !!sessionStorage.getItem('auth_token');

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

// GuestGuard: Sadece kimlik doğrulama yapmamış kullanıcılar için
interface GuestGuardProps {
    children: ReactElement;
}

const GuestGuard: FC<GuestGuardProps> = ({ children }) => {
    const isAuthenticated = !!sessionStorage.getItem('auth_token');

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={
                    <GuestGuard>
                        <Login />
                    </GuestGuard>
                }
            />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <AuthGuard>
                        <Layout />
                    </AuthGuard>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="questions" element={<QuestionList />} />
                <Route path="questions/add" element={<AddQuestion />} />
                <Route path="questions/:id/edit" element={<AddQuestion />} />
                <Route path="games" element={<GameList />} />
                <Route path="games/:id" element={<GameDetail />} />
                <Route path="exports" element={<ExportList />} />
                <Route path="exports/create" element={<CreateExport />} />
                <Route path="settings" element={<Settings />} />
                {/* Other protected routes will go here */}
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;