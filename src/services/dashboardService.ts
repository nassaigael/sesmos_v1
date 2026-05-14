// services/dashboardService.ts
import api from '../api/axiosConfig';
import type { AxiosResponse } from 'axios';

// Types
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
    imageUrl: string;
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

export interface TopProduct {
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    imageUrl: string;
}

class DashboardService {
    private static instance: DashboardService;

    private constructor() { }

    static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }

    /**
     * Récupère toutes les données du dashboard
     */
    async getDashboardData(): Promise<DashboardData> {
        try {
            const response: AxiosResponse<DashboardData> = await api.get('/dashboard');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des données du dashboard:', error);
            throw error;
        }
    }

    /**
     * Récupère les données du dashboard sur une période spécifique
     */
    async getDashboardDataByDateRange(startDate: string, endDate: string): Promise<DashboardData> {
        try {
            const response: AxiosResponse<DashboardData> = await api.get('/dashboard/range', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des données par période:', error);
            throw error;
        }
    }

    /**
     * Récupère les ventes par jour
     * @param days Nombre de jours (défaut: 30)
     */
    async getSalesByDay(days: number = 30): Promise<SalesByDay[]> {
        try {
            const response: AxiosResponse<SalesByDay[]> = await api.get('/dashboard/sales-by-day', {
                params: { days }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par jour:', error);
            return [];
        }
    }

    /**
     * Récupère les ventes par mois
     * @param year Année (défaut: année courante)
     */
    async getSalesByMonth(year?: number): Promise<SalesByMonth[]> {
        try {
            const currentYear = year || new Date().getFullYear();
            const response: AxiosResponse<SalesByMonth[]> = await api.get('/dashboard/sales-by-month', {
                params: { year: currentYear }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par mois:', error);
            return [];
        }
    }

    /**
     * Récupère les ventes par semaine
     * @param weeks Nombre de semaines (défaut: 12)
     */
    async getSalesByWeek(weeks: number = 12): Promise<SalesByDay[]> {
        try {
            const response: AxiosResponse<SalesByDay[]> = await api.get('/dashboard/sales-by-week', {
                params: { weeks }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par semaine:', error);
            return [];
        }
    }

    /**
     * Récupère le top des produits
     * @param limit Nombre de produits (défaut: 5)
     */
    async getTopProducts(limit: number = 5): Promise<ProductSales[]> {
        try {
            const response: AxiosResponse<ProductSales[]> = await api.get('/dashboard/top-products', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du top produits:', error);
            return [];
        }
    }

    /**
     * Récupère les performances par région
     */
    async getRegionalPerformance(): Promise<RegionSales[]> {
        try {
            const response: AxiosResponse<RegionSales[]> = await api.get('/dashboard/regional-performance');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des performances régionales:', error);
            return [];
        }
    }

    /**
     * Récupère les statistiques des équipements
     */
    async getEquipmentStats(): Promise<EquipmentStats> {
        try {
            const response: AxiosResponse<EquipmentStats> = await api.get('/dashboard/equipment-stats');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques équipements:', error);
            throw error;
        }
    }

    /**
     * Récupère les alertes récentes
     * @param limit Nombre d'alertes (défaut: 10)
     */
    async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
        try {
            const response: AxiosResponse<Alert[]> = await api.get('/dashboard/recent-alerts', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des alertes:', error);
            return [];
        }
    }

    /**
     * Exporte le rapport du dashboard
     * @param format Format d'export ('pdf' ou 'excel')
     */
    async exportDashboardReport(format: 'pdf' | 'excel'): Promise<Blob> {
        try {
            const response: AxiosResponse<Blob> = await api.get(`/dashboard/export/${format}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'export ${format}:`, error);
            throw error;
        }
    }

    /**
     * Exporte le rapport avec période personnalisée
     * @param format Format d'export
     * @param startDate Date de début
     * @param endDate Date de fin
     */
    async exportDashboardReportWithDateRange(
        format: 'pdf' | 'excel',
        startDate: string,
        endDate: string
    ): Promise<Blob> {
        try {
            const response: AxiosResponse<Blob> = await api.get(`/dashboard/export/${format}`, {
                params: { startDate, endDate },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'export ${format} avec période:`, error);
            throw error;
        }
    }

    /**
     * Récupère le résumé des ventes
     */
    async getSalesSummary(): Promise<SalesSummary> {
        try {
            const response: AxiosResponse<SalesSummary> = await api.get('/dashboard/sales-summary');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du résumé des ventes:', error);
            throw error;
        }
    }

    /**
     * Récupère les KPI pour le dashboard
     */
    async getKPIs(): Promise<{
        totalRevenue: number;
        totalSales: number;
        averageOrderValue: number;
        conversionRate: number;
        growthRate: number;
    }> {
        try {
            const response: AxiosResponse = await api.get('/dashboard/kpis');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des KPI:', error);
            throw error;
        }
    }

    /**
     * Récupère les données en temps réel via WebSocket
     * Note: Pour utiliser cette méthode, il faut d'abord établir une connexion WebSocket
     */
    getWebSocketUrl(): string {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/dashboard`;
    }

    /**
     * Rafraîchit les données du dashboard
     */
    async refreshDashboard(): Promise<DashboardData> {
        try {
            const response: AxiosResponse<DashboardData> = await api.post('/dashboard/refresh');
            return response.data;
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du dashboard:', error);
            throw error;
        }
    }

    /**
     * Récupère les données avec mise en cache
     * @param forceRefresh Force le rafraîchissement du cache
     */
    private cachedData: { data: DashboardData | null; timestamp: number | null } = {
        data: null,
        timestamp: null
    };
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

    /**
     * Invalide le cache du dashboard
     */
    invalidateCache(): void {
        this.cachedData.data = null;
        this.cachedData.timestamp = null;
    }
}

// Export d'une instance unique
const dashboardService = DashboardService.getInstance();
export default dashboardService;