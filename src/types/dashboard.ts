// types/dashboard.ts
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
    latitude: number | null;  // Changé: allow null
    longitude: number | null; // Changé: allow null
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