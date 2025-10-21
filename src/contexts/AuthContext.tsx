'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (username?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    const response = await apiService.getProfile();
                    if (response.data) {
                        setUser(response.data.user);
                    } else {
                        localStorage.removeItem('auth_token');
                        setToken(null);
                    }
                } catch {
                    localStorage.removeItem('auth_token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login(email, password);
            if (response.data) {
                const { token: newToken, user: userData } = response.data;
                localStorage.setItem('auth_token', newToken);
                setToken(newToken);
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Login failed' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await apiService.register(username, email, password);
            if (response.data) {
                const { token: newToken, user: userData } = response.data;
                localStorage.setItem('auth_token', newToken);
                setToken(newToken);
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Registration failed' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('selectedProject');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (username?: string, avatar?: string) => {
        try {
            const response = await apiService.updateProfile(username, avatar);
            if (response.data) {
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Update failed' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
