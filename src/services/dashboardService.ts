import api from '../api/axiosConfig';
import type { AxiosResponse } from 'axios';

export interface SalesSummary {
    totalRevenue: number;
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalSales: number;
    growthRate: number;
}

export interface ProductSales {
    productId: string;
    productName: string;
    imageUrl: string | null;
    quantity: number;
    revenue: number;
}

export interface RegionSales {
    regionId: string;
    regionName: string;
    revenue: number;
    latitude: number | null;
    longitude: number | null;
}

export interface EquipmentStats {
    total: number;
    active: number;
    maintenance: number;
    down: number;
    availabilityRate: number;
}

export interface Alert {
    id: string;
    message: string;
    type: string;
    timestamp: string;
}

export interface DashboardData {
    salesSummary: SalesSummary;
    topProducts: ProductSales[];
    regionalPerformance: RegionSales[];
    equipmentStats: EquipmentStats;
    recentAlerts: Alert[];
}

export interface SalesByDay {
    date: string;
    revenue: number;
    sales: number;
}

export interface SalesByMonth {
    month: string;
    revenue: number;
    sales: number;
}

class DashboardService {
    private static instance: DashboardService;
    private cachedData: { data: DashboardData | null; timestamp: number | null } = {
        data: null,
        timestamp: null
    };
    private readonly CACHE_DURATION = 5 * 60 * 1000;

    private constructor() { }

    static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }

    async getDashboardData(): Promise<DashboardData> {
        const response: AxiosResponse<DashboardData> = await api.get('/dashboard');
        return response.data;
    }

    async getDashboardDataByDateRange(startDate: string, endDate: string): Promise<DashboardData> {
        const response: AxiosResponse<DashboardData> = await api.get('/dashboard/range', {
            params: { startDate, endDate }
        });
        return response.data;
    }

    async getDashboardDataWithCache(forceRefresh: boolean = false): Promise<DashboardData> {
        const now = Date.now();

        if (!forceRefresh &&
            this.cachedData.data &&
            this.cachedData.timestamp &&
            (now - this.cachedData.timestamp) < this.CACHE_DURATION) {
            return this.cachedData.data;
        }

        const data = await this.getDashboardData();
        this.cachedData.data = data;
        this.cachedData.timestamp = now;
        return data;
    }

    invalidateCache(): void {
        this.cachedData.data = null;
        this.cachedData.timestamp = null;
    }

    async getSalesSummary(): Promise<SalesSummary> {
        const response: AxiosResponse<SalesSummary> = await api.get('/dashboard/sales-summary');
        return response.data;
    }

    async getTopProducts(limit: number = 5): Promise<ProductSales[]> {
        const response: AxiosResponse<ProductSales[]> = await api.get('/dashboard/top-products', {
            params: { limit }
        });
        return response.data;
    }

    async getRegionalPerformance(): Promise<RegionSales[]> {
        const response: AxiosResponse<RegionSales[]> = await api.get('/dashboard/regional-performance');
        return response.data;
    }

    async getEquipmentStats(): Promise<EquipmentStats> {
        const response: AxiosResponse<EquipmentStats> = await api.get('/dashboard/equipment-stats');
        return response.data;
    }

    async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
        const response: AxiosResponse<Alert[]> = await api.get('/dashboard/recent-alerts', {
            params: { limit }
        });
        return response.data;
    }

    async getSalesByDay(days: number = 30): Promise<SalesByDay[]> {
        const response: AxiosResponse<SalesByDay[]> = await api.get('/dashboard/sales-by-day', {
            params: { days }
        });
        return response.data;
    }

    async getSalesByMonth(year?: number): Promise<SalesByMonth[]> {
        const currentYear = year || new Date().getFullYear();
        const response: AxiosResponse<SalesByMonth[]> = await api.get('/dashboard/sales-by-month', {
            params: { year: currentYear }
        });
        return response.data;
    }

    async getSalesByWeek(weeks: number = 12): Promise<SalesByDay[]> {
        const response: AxiosResponse<SalesByDay[]> = await api.get('/dashboard/sales-by-week', {
            params: { weeks }
        });
        return response.data;
    }

    async getTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response: AxiosResponse<number> = await api.get('/dashboard/total-revenue', { params });
        return response.data;
    }

    async getTotalSalesCount(startDate?: string, endDate?: string): Promise<number> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response: AxiosResponse<number> = await api.get('/dashboard/total-sales-count', { params });
        return response.data;
    }

    async getKPIs(): Promise<{
        totalRevenue: number;
        totalSales: number;
        averageOrderValue: number;
        conversionRate: number;
        growthRate: number;
    }> {
        const response: AxiosResponse = await api.get('/dashboard/kpis');
        return response.data;
    }

    async getMonthlySalesEvolution(year?: number): Promise<{ month: string; sales: number }[]> {
        const targetYear = year || new Date().getFullYear();
        const response: AxiosResponse<{ month: string; sales: number }[]> = await api.get('/dashboard/monthly-sales-evolution', {
            params: { year: targetYear }
        });
        return response.data;
    }

    async getDailySalesEvolution(): Promise<{ date: string; sales: number }[]> {
        const response: AxiosResponse<{ date: string; sales: number }[]> = await api.get('/dashboard/daily-sales-evolution');
        return response.data;
    }

    async getCurrentMonthDashboard(): Promise<DashboardData> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return this.getDashboardDataByDateRange(
            startOfMonth.toISOString(),
            endOfMonth.toISOString()
        );
    }

    async getCurrentYearDashboard(): Promise<DashboardData> {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return this.getDashboardDataByDateRange(
            startOfYear.toISOString(),
            endOfYear.toISOString()
        );
    }

    async exportDashboardReport(format: 'pdf' | 'excel'): Promise<Blob> {
        const response: AxiosResponse<Blob> = await api.get(`/dashboard/export/${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    async exportDashboardReportWithDateRange(
        format: 'pdf' | 'excel',
        startDate: string,
        endDate: string
    ): Promise<Blob> {
        const response: AxiosResponse<Blob> = await api.get(`/dashboard/export/${format}`, {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        return response.data;
    }

    async refreshDashboard(): Promise<DashboardData> {
        const response: AxiosResponse<DashboardData> = await api.post('/dashboard/refresh');
        this.invalidateCache();
        return response.data;
    }

    getWebSocketUrl(): string {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/dashboard`;
    }
}

const dashboardService = DashboardService.getInstance();
export default dashboardService;