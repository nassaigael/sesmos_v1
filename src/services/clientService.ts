import api from '../api/axiosConfig';
import type { Client, ClientRequest, ClientFilters } from '../types/client.types';

class ClientService {
    private static instance: ClientService;

    static getInstance(): ClientService {
        if (!ClientService.instance) {
            ClientService.instance = new ClientService();
        }
        return ClientService.instance;
    }

    async getAllClients(): Promise<Client[]> {
        const response = await api.get('/clients');
        return response.data;
    }

    async getClientsPaged(page: number = 0, size: number = 12): Promise<any> {
        const response = await api.get('/clients/paged', {
            params: { page, size }
        });
        return response.data;
    }

    async getClientById(id: string): Promise<Client> {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    }

    async getClientByEmail(email: string): Promise<Client> {
        const response = await api.get(`/clients/email/${email}`);
        return response.data;
    }

    async getActiveClients(): Promise<Client[]> {
        const response = await api.get('/clients/active');
        return response.data;
    }

    async searchClients(search: string, page: number = 0, size: number = 12): Promise<any> {
        const response = await api.get('/clients/search', {
            params: { search, page, size }
        });
        return response.data;
    }

    async createClient(request: ClientRequest): Promise<Client> {
        const response = await api.post('/clients', request);
        return response.data;
    }

    async updateClient(id: string, request: ClientRequest): Promise<Client> {
        const response = await api.put(`/clients/${id}`, request);
        return response.data;
    }

    async deleteClient(id: string): Promise<void> {
        await api.delete(`/clients/${id}`);
    }

    async activateClient(id: string): Promise<void> {
        await api.post(`/clients/${id}/activate`);
    }

    async deactivateClient(id: string): Promise<void> {
        await api.post(`/clients/${id}/deactivate`);
    }

    async getClientsWithFilters(filters: ClientFilters, page: number = 0, size: number = 12): Promise<any> {
        const params: any = { page, size };
        if (filters.search) params.search = filters.search;
        if (filters.active !== undefined) params.active = filters.active;

        const response = await api.get('/clients/search', { params });
        return response.data;
    }

    async uploadClientLogo(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', 'clients');

        const response = await api.post('/clients/upload-logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.imageUrl;
    }
}

export default ClientService.getInstance();