// services/dashboardApi.ts
import api from './axiosConfig'

export interface SalesSummary {
    totalRevenue: number
    dailyRevenue: number
    weeklyRevenue: number
    monthlyRevenue: number
    yearlyRevenue: number
    totalSales: number
    growthRate: number
}

export interface ProductSales {
    productId: string
    productName: string
    imageUrl: string | null
    quantity: number
    revenue: number
}

export interface RegionSales {
    regionId: string
    regionName: string
    revenue: number
    latitude: number | null
    longitude: number | null
}

export interface EquipmentStats {
    total: number
    active: number
    maintenance: number
    down: number
    availabilityRate: number
}

export interface Alert {
    id: string
    message: string
    type: string
    timestamp: string
}

export interface DashboardResponse {
    salesSummary: SalesSummary
    topProducts: ProductSales[]
    regionalPerformance: RegionSales[]
    equipmentStats: EquipmentStats
    recentAlerts: Alert[]
}

export const dashboardApi = {
    getDashboard: async (): Promise<DashboardResponse> => {
        const response = await api.get<DashboardResponse>('/dashboard')
        return response.data
    },

    // URL corrigée : /dashboard/range au lieu de /dashboard/period
    getDashboardByDateRange: async (startDate: string, endDate: string): Promise<DashboardResponse> => {
        const response = await api.get<DashboardResponse>('/dashboard/range', {
            params: { startDate, endDate }
        })
        return response.data
    },

    getSalesSummary: async (): Promise<SalesSummary> => {
        const response = await api.get<SalesSummary>('/dashboard/sales-summary')
        return response.data
    },

    getTopProducts: async (limit: number = 5): Promise<ProductSales[]> => {
        const response = await api.get<ProductSales[]>('/dashboard/top-products', {
            params: { limit }
        })
        return response.data
    },

    getRegionalPerformance: async (): Promise<RegionSales[]> => {
        const response = await api.get<RegionSales[]>('/dashboard/regional-performance')
        return response.data
    },

    getEquipmentStats: async (): Promise<EquipmentStats> => {
        const response = await api.get<EquipmentStats>('/dashboard/equipment-stats')
        return response.data
    },

    getRecentAlerts: async (limit: number = 10): Promise<Alert[]> => {
        const response = await api.get<Alert[]>('/dashboard/recent-alerts', {
            params: { limit }
        })
        return response.data
    },

    getCurrentMonthDashboard: async (): Promise<DashboardResponse> => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return dashboardApi.getDashboardByDateRange(
            startOfMonth.toISOString(),
            endOfMonth.toISOString()
        )
    },

    getCurrentYearDashboard: async (): Promise<DashboardResponse> => {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const endOfYear = new Date(now.getFullYear(), 11, 31)
        return dashboardApi.getDashboardByDateRange(
            startOfYear.toISOString(),
            endOfYear.toISOString()
        )
    },

    getMonthlySalesEvolution: async (year?: number): Promise<{ month: string; sales: number }[]> => {
        const targetYear = year || new Date().getFullYear()
        const response = await api.get<{ month: string; sales: number }[]>(
            '/dashboard/monthly-sales-evolution',
            { params: { year: targetYear } }
        )
        return response.data
    },

    getDailySalesEvolution: async (): Promise<{ date: string; sales: number }[]> => {
        const response = await api.get<{ date: string; sales: number }[]>('/dashboard/daily-sales-evolution')
        return response.data
    },

    getTotalRevenue: async (startDate?: string, endDate?: string): Promise<number> => {
        const params: any = {}
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate
        const response = await api.get<number>('/dashboard/total-revenue', { params })
        return response.data
    },

    getTotalSalesCount: async (startDate?: string, endDate?: string): Promise<number> => {
        const params: any = {}
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate
        const response = await api.get<number>('/dashboard/total-sales-count', { params })
        return response.data
    }
}

export default dashboardApi