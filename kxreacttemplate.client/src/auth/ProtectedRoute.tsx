import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
