import api from '../api/axiosConfig';
import type { Equipment, EquipmentRequest, EquipmentStatus } from '../types/equipment.types';

class EquipmentService {
    private static instance: EquipmentService;

    static getInstance(): EquipmentService {
        if (!EquipmentService.instance) {
            EquipmentService.instance = new EquipmentService();
        }
        return EquipmentService.instance;
    }

    async getAll(): Promise<Equipment[]> {
        const response = await api.get('/equipment');
        return response.data;
    }

    async getById(id: string): Promise<Equipment> {
        const response = await api.get(`/equipment/${id}`);
        return response.data;
    }

    async create(equipmentRequest: EquipmentRequest): Promise<Equipment> {
        const response = await api.post('/equipment', equipmentRequest);
        return response.data;
    }

    async update(id: string, equipmentRequest: EquipmentRequest): Promise<Equipment> {
        const response = await api.put(`/equipment/${id}`, equipmentRequest);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`/equipment/${id}`);
    }

    async updateStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
        const response = await api.patch(`/equipment/${id}/status`, { status });
        return response.data;
    }

    async getProducts(): Promise<any[]> {
        try {
            const response = await api.get('/products');
            return response.data.content || [];
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    async getRegions(): Promise<any[]> {
        try {
            const response = await api.get('/regions');
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return response.data.content || [];
        } catch (error) {
            console.error('Error loading regions:', error);
            return [];
        }
    }

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', 'equipment');

        const response = await api.post('/products/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000
        });
        return response.data.imageUrl;
    }

    async getStats(): Promise<{ total: number; active: number; maintenance: number; down: number }> {
        const response = await api.get('/equipment/stats');
        return response.data;
    }

    async exportToExcel(): Promise<Blob> {
        const response = await api.get('/equipment/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
}

export default EquipmentService.getInstance();