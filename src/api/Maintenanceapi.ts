import api from './axiosConfig';
import type { Maintenance, MaintenanceRequest, MaintenanceStatus } from '../types/maintenance.types';

const maintenanceApi = {
    getAll: () => api.get<Maintenance[]>('/maintenances').then(r => r.data),
    getPaged: (page = 0, size = 10) =>
        api.get('/maintenances/paged', { params: { page, size, sort: 'createdAt,desc' } }).then(r => r.data),
    getById: (id: string) => api.get<Maintenance>(`/maintenances/${id}`).then(r => r.data),
    getByEquipment: (equipmentId: string) =>
        api.get<Maintenance[]>(`/maintenances/equipment/${equipmentId}`).then(r => r.data),
    getByTechnician: (technicianId: string) =>
        api.get<Maintenance[]>(`/maintenances/technician/${technicianId}`).then(r => r.data),
    create: (data: MaintenanceRequest) => api.post<Maintenance>('/maintenances', data).then(r => r.data),
    update: (id: string, data: MaintenanceRequest) =>
        api.put<Maintenance>(`/maintenances/${id}`, data).then(r => r.data),
    updateStatus: (id: string, status: MaintenanceStatus) =>
        api.patch<Maintenance>(`/maintenances/${id}/status`, null, { params: { status } }).then(r => r.data),
    delete: (id: string) => api.delete(`/maintenances/${id}`),
};

export default maintenanceApi;