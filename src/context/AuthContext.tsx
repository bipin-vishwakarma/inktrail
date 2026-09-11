import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
    id: string;
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
    authProvider: 'google' | 'github' | 'student' | 'email';
    studentId?: string;
    collegeName?: string;
    savedDocsCount: number;
    cloudBackupEnabled: boolean;
    createdAt: string;
}

export type User = UserProfile;

export interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (customProfile?: Partial<UserProfile>) => void;
    loginWithGoogle: (email?: string, name?: string) => Promise<void>;
    loginWithGithub: (username?: string) => Promise<void>;
    loginWithStudentId: (name: string, studentId: string, college: string) => Promise<void>;
    loginWithEmail: (email: string, name?: string) => Promise<void>;
    logout: () => void;
    updateUserProfile: (updates: Partial<UserProfile>) => void;
    incrementSavedDocs: () => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem('inktrail_user') || localStorage.getItem('papertrail_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure required modern fields exist
                return {
                    id: parsed.id || `user-${Date.now()}`,
                    name: parsed.name || 'InkTrail Scholar',
                    given_name: parsed.given_name || parsed.name?.split(' ')[0] || 'Scholar',
                    family_name: parsed.family_name || parsed.name?.split(' ').slice(1).join(' ') || '',
                    email: parsed.email || 'scholar@university.edu',
                    picture: parsed.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(parsed.name || 'Scholar')}`,
                    authProvider: parsed.authProvider || 'student',
                    studentId: parsed.studentId || 'UPES-2026',
                    collegeName: parsed.collegeName || 'UPES Dehradun',
                    savedDocsCount: parsed.savedDocsCount ?? 4,
                    cloudBackupEnabled: parsed.cloudBackupEnabled ?? true,
                    createdAt: parsed.createdAt || new Date().toISOString(),
                };
            }
        } catch (e) {
            console.warn('Failed to parse stored user profile:', e);
        }
        return null;
    });

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const persistUser = useCallback((updated: UserProfile | null) => {
        setUser(updated);
        if (updated) {
            try {
                localStorage.setItem('inktrail_user', JSON.stringify(updated));
            } catch (err) {
                console.warn('Failed to write user to localStorage:', err);
            }
        } else {
            localStorage.removeItem('inktrail_user');
            localStorage.removeItem('papertrail_user');
        }
    }, []);

    const login = useCallback((customProfile?: Partial<UserProfile>) => {
        const defaultProfile: UserProfile = {
            id: `usr-${Date.now()}`,
            name: customProfile?.name || 'Student Scholar',
            given_name: customProfile?.given_name || customProfile?.name?.split(' ')[0] || 'Student',
            family_name: customProfile?.family_name || '',
            email: customProfile?.email || 'scholar@upes.ac.in',
            picture: customProfile?.picture || 'https://api.dicebear.com/7.x/notionists/svg?seed=scholar',
            authProvider: customProfile?.authProvider || 'student',
            studentId: customProfile?.studentId || '500123456',
            collegeName: customProfile?.collegeName || 'UPES Dehradun',
            savedDocsCount: customProfile?.savedDocsCount ?? 3,
            cloudBackupEnabled: true,
            createdAt: new Date().toISOString(),
        };

        persistUser({ ...defaultProfile, ...customProfile });
        setAuthModalOpen(false);
    }, [persistUser]);

    const loginWithGoogle = useCallback(async (customEmail?: string, customName?: string) => {
        setIsLoading(true);
        // Simulate OAuth roundtrip latency for realistic feedback
        await new Promise((r) => setTimeout(r, 450));
        
        const name = customName || 'Aarav Sharma';
        const email = customEmail || 'aarav.sharma.upes@gmail.com';
        const [given, ...rest] = name.split(' ');
        
        const profile: UserProfile = {
            id: `goog-${Date.now()}`,
            name,
            given_name: given,
            family_name: rest.join(' '),
            email,
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
            authProvider: 'google',
            studentId: 'UPES-2026-CS',
            collegeName: 'UPES Dehradun',
            savedDocsCount: 5,
            cloudBackupEnabled: true,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
    }, [persistUser]);

    const loginWithGithub = useCallback(async (username?: string) => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 450));
        
        const ghUser = username?.trim() || 'student-developer';
        const profile: UserProfile = {
            id: `gh-${Date.now()}`,
            name: ghUser,
            given_name: ghUser,
            family_name: '',
            email: `${ghUser.toLowerCase()}@users.noreply.github.com`,
            picture: `https://github.com/${ghUser}.png`,
            authProvider: 'github',
            studentId: 'DEV-STUDENT',
            collegeName: 'UPES School of Computer Science',
            savedDocsCount: 7,
            cloudBackupEnabled: true,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
    }, [persistUser]);

    const loginWithStudentId = useCallback(async (name: string, studentId: string, college: string) => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 400));
        
        const trimmedName = name.trim() || 'UPES Scholar';
        const [given, ...rest] = trimmedName.split(' ');
        
        const profile: UserProfile = {
            id: `stu-${Date.now()}`,
            name: trimmedName,
            given_name: given,
            family_name: rest.join(' '),
            email: `${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@${college.toLowerCase().includes('upes') ? 'stu.upes.ac.in' : 'university.edu'}`,
            picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentId)}`,
            authProvider: 'student',
            studentId: studentId.trim() || 'UPES-700192',
            collegeName: college.trim() || 'UPES Dehradun',
            savedDocsCount: 2,
            cloudBackupEnabled: true,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
    }, [persistUser]);

    const loginWithEmail = useCallback(async (email: string, customName?: string) => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 400));
        
        const userEmail = email.trim() || 'student@university.edu';
        const defaultName = customName || userEmail.split('@')[0].replace(/[._-]/g, ' ');
        const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        const [given, ...rest] = capitalized.split(' ');

        const profile: UserProfile = {
            id: `mail-${Date.now()}`,
            name: capitalized,
            given_name: given,
            family_name: rest.join(' '),
            email: userEmail,
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userEmail)}`,
            authProvider: 'email',
            studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
            collegeName: 'University Scholar',
            savedDocsCount: 1,
            cloudBackupEnabled: true,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
    }, [persistUser]);

    const logout = useCallback(() => {
        persistUser(null);
    }, [persistUser]);

    const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            try {
                localStorage.setItem('inktrail_user', JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to update local user:', e);
            }
            return updated;
        });
    }, []);

    const incrementSavedDocs = useCallback(() => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, savedDocsCount: (prev.savedDocsCount || 0) + 1 };
            try {
                localStorage.setItem('inktrail_user', JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to update local user savedDocsCount:', e);
            }
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            login, 
            loginWithGoogle,
            loginWithGithub,
            loginWithStudentId,
            loginWithEmail,
            logout,
            updateUserProfile,
            incrementSavedDocs,
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
