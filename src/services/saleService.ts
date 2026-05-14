import api from '../api/axiosConfig';
import type { Sale, SaleRequest, SalesFilter, SalesStats } from '../types/sales';

class SaleService {
    private static instance: SaleService;

    static getInstance(): SaleService {
        if (!SaleService.instance) {
            SaleService.instance = new SaleService();
        }
        return SaleService.instance;
    }

    async getAllSales(page: number = 0, size: number = 10, sort?: string): Promise<any> {
        const response = await api.get('/sales', {
            params: { page, size, sort: sort || 'date,desc' }
        });
        return response.data;
    }

    async getSaleById(id: string): Promise<Sale> {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    }

    async createSale(saleRequest: SaleRequest): Promise<Sale> {
        const response = await api.post('/sales', saleRequest);
        return response.data;
    }

    async updateSale(id: string, saleRequest: SaleRequest): Promise<Sale> {
        const response = await api.put(`/sales/${id}`, saleRequest);
        return response.data;
    }

    async deleteSale(id: string): Promise<void> {
        await api.delete(`/sales/${id}`);
    }

    async getSalesWithFilters(filters: SalesFilter, page: number = 0, size: number = 10): Promise<any> {
        const params: any = { page, size };
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.productId) params.productId = filters.productId;
        if (filters.regionId) params.regionId = filters.regionId;
        if (filters.userId) params.userId = filters.userId;
        if (filters.minAmount) params.minAmount = filters.minAmount;
        if (filters.maxAmount) params.maxAmount = filters.maxAmount;
        if (filters.searchTerm) params.search = filters.searchTerm;

        const response = await api.get('/sales/filter', { params });
        return response.data;
    }

    async getSalesStats(startDate?: string, endDate?: string): Promise<SalesStats> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get('/sales/stats', { params });
        const data = response.data;

        return {
            totalRevenue: data.totalRevenue || 0,
            totalSales: data.totalSales || 0,
            averageOrderValue: data.totalSales > 0 ? (data.totalRevenue / data.totalSales) : 0,
            bestProduct: data.bestProduct || null,
            bestRegion: data.bestRegion || null,
            salesByDay: data.salesByDay || [],
            salesByProduct: data.salesByProduct || [],
            salesByRegion: data.salesByRegion || []
        };
    }

    async getProducts(): Promise<any[]> {
        try {
            const response = await api.get('/products/filter', {
                params: { page: 0, size: 100 }
            });
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

    async getUsers(): Promise<any[]> {
        try {
            const response = await api.get('/users/filter', {
                params: { page: 0, size: 100 }
            });
            return response.data.content || [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }
}

export default SaleService.getInstance();