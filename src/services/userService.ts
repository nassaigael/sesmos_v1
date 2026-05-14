// services/userService.ts
import api from '../api/axiosConfig';
import type { User, UserRequest, UserFilters, UserStats } from '../types/user';

class UserService {
    private static instance: UserService;

    private constructor() { }

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    // Récupérer tous les utilisateurs (version paginée)
    async getUsers(page: number = 0, size: number = 10, sort?: string): Promise<any> {
        try {
            const response = await api.get('/users/paged', {
                params: { page, size, sort: sort || 'createdAt,desc' }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }

    // Récupérer tous les utilisateurs (liste complète)
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
            throw error;
        }
    }

    // Récupérer un utilisateur par ID
    async getUserById(id: string): Promise<User> {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
            throw error;
        }
    }

    // Récupérer un utilisateur par email
    async getUserByEmail(email: string): Promise<User> {
        try {
            const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur avec email ${email}:`, error);
            throw error;
        }
    }

    // Créer un utilisateur
    async createUser(userRequest: UserRequest): Promise<User> {
        try {
            const response = await api.post('/users', userRequest);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    // Mettre à jour un utilisateur
    async updateUser(id: string, userRequest: UserRequest): Promise<User> {
        try {
            const response = await api.put(`/users/${id}`, userRequest);
            return response.data;
        } catch (error: any) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    // Supprimer un utilisateur
    async deleteUser(id: string): Promise<void> {
        try {
            await api.delete(`/users/${id}`);
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
            throw error;
        }
    }

    // Bloquer un utilisateur
    async lockUser(id: string): Promise<void> {
        try {
            await api.post(`/users/${id}/lock`);
        } catch (error) {
            console.error(`Erreur lors du blocage de l'utilisateur ${id}:`, error);
            throw error;
        }
    }

    // Débloquer un utilisateur
    async unlockUser(id: string): Promise<void> {
        try {
            await api.post(`/users/${id}/unlock`);
        } catch (error) {
            console.error(`Erreur lors du déblocage de l'utilisateur ${id}:`, error);
            throw error;
        }
    }

    // Réinitialiser le mot de passe
    async resetPassword(id: string, newPassword: string): Promise<void> {
        try {
            await api.post(`/users/${id}/reset-password`, { password: newPassword });
        } catch (error) {
            console.error(`Erreur lors de la réinitialisation du mot de passe pour l'utilisateur ${id}:`, error);
            throw error;
        }
    }

    // Récupérer les utilisateurs avec filtres (recherche, rôle, statut)
    async getUsersWithFilters(
        filters: UserFilters,
        page: number = 0,
        size: number = 10
    ): Promise<{
        content: User[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    }> {
        try {
            const params: any = { page, size };

            if (filters.search && filters.search.trim()) {
                params.search = filters.search.trim();
            }
            if (filters.role) {
                params.role = filters.role;
            }
            if (filters.status !== undefined) {
                params.active = filters.status === 'active';
            }

            const response = await api.get('/users/filter', { params });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs avec filtres:', error);
            throw error;
        }
    }

    // Récupérer les statistiques des utilisateurs
    async getStats(): Promise<UserStats> {
        try {
            const response = await api.get('/users/stats');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            // Retourner des statistiques par défaut en cas d'erreur
            return {
                totalUsers: 0,
                activeUsers: 0,
                lockedUsers: 0,
                byRole: {
                    ADMIN: 0,
                    MANAGER: 0,
                    TECHNICIAN: 0
                }
            };
        }
    }

    // Uploader un avatar
    async uploadAvatar(file: File, userId?: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            if (userId) {
                formData.append('userId', userId);
            }

            const response = await api.post('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.imageUrl;
        } catch (error) {
            console.error('Erreur lors de l\'upload de l\'avatar:', error);
            throw error;
        }
    }

    // Exporter les utilisateurs en Excel
    async exportToExcel(filters?: UserFilters): Promise<Blob> {
        try {
            const params: any = {};
            if (filters?.search && filters.search.trim()) {
                params.search = filters.search.trim();
            }
            if (filters?.role) {
                params.role = filters.role;
            }
            if (filters?.status !== undefined) {
                params.active = filters.status === 'active';
            }

            const response = await api.get('/users/export/excel', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'export des utilisateurs:', error);
            throw error;
        }
    }

    // Récupérer le nombre total d'utilisateurs
    async getTotalCount(): Promise<number> {
        try {
            const stats = await this.getStats();
            return stats.totalUsers;
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre total d\'utilisateurs:', error);
            return 0;
        }
    }

    // Vérifier si un email existe déjà
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            await this.getUserByEmail(email);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default UserService.getInstance();