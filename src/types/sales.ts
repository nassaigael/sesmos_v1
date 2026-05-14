export interface Sale {
    id: string;
    date: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    user: {
        id: string;
        name: string;
        email: string;
    };
    product: {
        id: string;
        name: string;
        description?: string;
        price: number;
        category: string;
        categoryDisplayName: string;
        imageUrl?: string;
    };
    region: {
        id: string;
        name: string;
        country: string;
    };
}

export interface SaleRequest {
    userId: string;
    regionId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
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
    searchTerm?: string;
}

export interface SalesStats {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    bestProduct: { id: string; name: string; revenue: number; quantity: number } | null;
    bestRegion: { id: string; name: string; revenue: number } | null;
    salesByDay: { date: string; count: number; revenue: number }[];
    salesByProduct: { productId: string; productName: string; quantity: number; revenue: number }[];
    salesByRegion?: { regionId: string; regionName: string; revenue: number }[];
}