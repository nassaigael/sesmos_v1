// services/regionService.ts
import api from '../api/axiosConfig';
import type { Region, RegionRequest, RegionFilters } from '../types/region.types';

class RegionService {
    private static instance: RegionService;

    static getInstance(): RegionService {
        if (!RegionService.instance) {
            RegionService.instance = new RegionService();
        }
        return RegionService.instance;
    }

    async getAllRegions(): Promise<Region[]> {
        const response = await api.get('/regions');
        return response.data;
    }

    async getRegionsPaged(page: number = 0, size: number = 10): Promise<any> {
        const response = await api.get('/regions/paged', {
            params: { page, size }
        });
        return response.data;
    }

    async getRegionById(id: string): Promise<Region> {
        const response = await api.get(`/regions/${id}`);
        return response.data;
    }

    async getRegionByName(name: string): Promise<Region> {
        const response = await api.get(`/regions/name/${encodeURIComponent(name)}`);
        return response.data;
    }

    async createRegion(regionRequest: RegionRequest): Promise<Region> {
        const response = await api.post('/regions', regionRequest);
        return response.data;
    }

    async updateRegion(id: string, regionRequest: RegionRequest): Promise<Region> {
        const response = await api.put(`/regions/${id}`, regionRequest);
        return response.data;
    }

    async deleteRegion(id: string): Promise<void> {
        await api.delete(`/regions/${id}`);
    }

    async getRegionsWithFilters(filters: RegionFilters, page: number = 0, size: number = 10): Promise<any> {
        const params: any = { page, size };
        if (filters.search) params.search = filters.search;
        if (filters.country) params.country = filters.country;

        const response = await api.get('/regions/filter', { params });
        return response.data;
    }
}

export default RegionService.getInstance();