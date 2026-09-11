import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/** Redirects unauthenticated users to /auth?redirect=<current-path> */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
    }, [isAuthenticated, navigate, location.pathname]);

    if (!isAuthenticated) return null;
    return <>{children}</>;
}
