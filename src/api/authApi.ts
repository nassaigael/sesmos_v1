import api from './axiosConfig';
import type { AuthRequest, AuthResponse, User } from '../types/auth.types';

export const authApi = {
    login: async (credentials: AuthRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
};