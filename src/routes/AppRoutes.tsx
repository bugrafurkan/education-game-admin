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
import Advertisements from '../pages/advertisements/Advertisements'; // Yeni reklam sayfası import'u
import QuestionGroupList from '../pages/question-groups/QuestionGroupList';
import AddQuestionGroup from '../pages/question-groups/AddQuestionGroup';
import QuestionGroupDetail from '../pages/question-groups/QuestionGroupDetail';
import EditQuestionGroup from '../pages/question-groups/EditQuestionGroup';
import CategoryList from '../pages/categories/CategoryList';
import AddEditCategory from '../pages/categories/AddEditCategory';
import UserManagement from "../pages/UserManagement.tsx";

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
                <Route path="advertisements" element={<Advertisements />} /> {/* Yeni reklam sayfası */}
                <Route path="question-groups" element={<QuestionGroupList />} />
                <Route path="question-groups/add" element={<AddQuestionGroup />} />
                <Route path="question-groups/:id" element={<QuestionGroupDetail />} />
                <Route path="question-groups/:id/edit" element={<EditQuestionGroup />} />
                <Route path="categories" element={<CategoryList />} />
                <Route path="categories/add" element={<AddEditCategory />} />
                <Route path="categories/:id/edit" element={<AddEditCategory />} />
                <Route path="/user-management" element={<UserManagement />} />

                {/* Other protected routes will go here */}
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;