import React, { createContext, useContext, useState } from 'react';

interface User {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    name: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('papertrail_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isLoading] = useState(false);

    const login = () => {
        // PaperTrail is 100% free and client-side — no Google login required
        setAuthModalOpen(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('papertrail_user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            login, 
            logout,
            isAuthModalOpen,
            setAuthModalOpen,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
