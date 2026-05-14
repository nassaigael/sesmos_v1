// types/sales.ts
export interface SaleItem {
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Sale {
    id: string;
    saleNumber: string;
    date: string;
    totalAmount: number;
    status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
    user: { id: string; name: string; email: string };
    region: { id: string; name: string; country: string };
    items: SaleItem[];
    createdAt: string;
    updatedAt: string;
}

export interface SaleRequest {
    userId: string;
    regionId: string;
    items: SaleItem[];
    date?: string;
}

export interface SalesFilter {
    startDate?: string;
    endDate?: string;
    productId?: string;
    regionId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export interface SalesStats {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    bestProduct: { id: string; name: string; revenue: number; quantity: number } | null;
    bestRegion: { id: string; name: string; revenue: number } | null;
    salesByDay: { date: string; count: number; revenue: number }[];
    salesByProduct: { productId: string; productName: string; quantity: number; revenue: number }[];
    salesByRegion: { regionId: string; regionName: string; revenue: number }[];
}