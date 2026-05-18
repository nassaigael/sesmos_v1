import api from './axiosConfig';
import type { Maintenance, MaintenanceRequest, MaintenanceStatus } from '../types/Maintenance.types';

class MaintenanceApi {
    private static instance: MaintenanceApi;

    static getInstance(): MaintenanceApi {
        if (!MaintenanceApi.instance) {
            MaintenanceApi.instance = new MaintenanceApi();
        }
        return MaintenanceApi.instance;
    }

    async getAll(): Promise<Maintenance[]> {
        const response = await api.get('/maintenances');
        return response.data;
    }

    async getById(id: string): Promise<Maintenance> {
        const response = await api.get(`/maintenances/${id}`);
        return response.data;
    }

    async create(request: MaintenanceRequest): Promise<Maintenance> {
        const response = await api.post('/maintenances', request);
        return response.data;
    }

    async update(id: string, request: MaintenanceRequest): Promise<Maintenance> {
        const response = await api.put(`/maintenances/${id}`, request);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`/maintenances/${id}`);
    }

    async updateStatus(id: string, status: MaintenanceStatus): Promise<Maintenance> {
        const response = await api.patch(`/maintenances/${id}/status`, { status });
        return response.data;
    }
}

export default MaintenanceApi.getInstance();