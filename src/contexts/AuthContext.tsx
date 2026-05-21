import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { authApi } from '../api/authApi';
import type { AuthResponse, User, StoredUser } from '../types/auth.types';
import { isTokenValid } from '../api/axiosConfig';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: string[]) => boolean;
    refreshUser: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) return;

            const response = await api.get('/users/me');
            const userData = response.data;

            const userState: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                imageUrl: userData.imageUrl,
                clientId: userData.clientId,
                accountNonLocked: userData.accountNonLocked ?? true,
                createdAt: userData.createdAt || new Date().toISOString(),
            };

            setUser(userState);

            const storedUser: StoredUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                type: 'Bearer',
                expiration: Date.now() + 24 * 60 * 60 * 1000,
                imageUrl: userData.imageUrl,
                clientId: userData.clientId,
            };
            localStorage.setItem('user', JSON.stringify(storedUser));
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    }, []);

    const updateUser = useCallback((userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                try {
                    const storedUser: StoredUser = JSON.parse(storedUserStr);
                    const updatedStoredUser = { ...storedUser, ...userData };
                    localStorage.setItem('user', JSON.stringify(updatedStoredUser));
                } catch (error) {
                    console.error('Error updating stored user:', error);
                }
            }
        }
    }, [user]);

    const uploadAvatar = useCallback(async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', 'avatars');

            const response = await api.post('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = response.data.imageUrl;

            await refreshUser();

            return imageUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }, [refreshUser]);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && isTokenValid() && storedUser) {
                try {
                    const parsedUser: StoredUser = JSON.parse(storedUser);
                    setToken(storedToken);

                    const userData: User = {
                        id: parsedUser.id,
                        name: parsedUser.name,
                        email: parsedUser.email,
                        role: parsedUser.role,
                        imageUrl: parsedUser.imageUrl,
                        clientId: parsedUser.clientId,
                        accountNonLocked: true,
                        createdAt: new Date().toISOString(),
                    };
                    setUser(userData);

                    await refreshUser();
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        try {
            const response: AuthResponse = await authApi.login({ email, password });
            const { token, type, expiration, imageUrl, clientId, ...userData } = response;

            const storedUser: StoredUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                type: type,
                expiration: expiration,
                imageUrl: imageUrl,
                clientId: clientId,
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(storedUser));
            setToken(token);

            const userState: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                imageUrl: imageUrl,
                clientId: clientId,
                accountNonLocked: true,
                createdAt: new Date().toISOString(),
            };
            setUser(userState);

            if (userState.role === 'CLIENT') {
                window.location.href = '/client/dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const hasRole = (roles: string[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && isTokenValid(),
        hasRole,
        refreshUser,
        updateUser,
        uploadAvatar,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};