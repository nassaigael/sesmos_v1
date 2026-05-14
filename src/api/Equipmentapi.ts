import api from './axiosConfig';
import type { Equipment, EquipmentRequest, EquipmentStatus } from '../types/equipment.types';

const equipmentApi = {
    getAll: () => api.get<Equipment[]>('/equipment').then(r => r.data),
    getPaged: (page = 0, size = 10) =>
        api.get('/equipment/paged', { params: { page, size, sort: 'createdAt,desc' } }).then(r => r.data),
    getById: (id: string) => api.get<Equipment>(`/equipment/${id}`).then(r => r.data),
    getByStatus: (status: EquipmentStatus) =>
        api.get<Equipment[]>(`/equipment/status/${status}`).then(r => r.data),
    getByRegion: (regionId: string) =>
        api.get<Equipment[]>(`/equipment/region/${regionId}`).then(r => r.data),
    create: (data: EquipmentRequest) => api.post<Equipment>('/equipment', data).then(r => r.data),
    update: (id: string, data: EquipmentRequest) =>
        api.put<Equipment>(`/equipment/${id}`, data).then(r => r.data),
    updateStatus: (id: string, status: EquipmentStatus) =>
        api.patch<Equipment>(`/equipment/${id}/status`, null, { params: { status } }).then(r => r.data),
    delete: (id: string) => api.delete(`/equipment/${id}`),
};

export default equipmentApi;