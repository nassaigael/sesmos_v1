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
    product: { id: string; name: string; price: number; imageUrl?: string; category?: string; categoryDisplayName?: string; description?: string; };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    client?: {
        id: string;
        companyName: string;
        logoUrl?: string;
    }; createdAt: string;
    updatedAt: string;
}

export interface SaleRequest {
    date: string;
    quantity: number;
    unitPrice: number;
    productId: string;
    regionId: string;
    userId: string;
    clientId?: string;
}

export interface SaleResponse {
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
        price: number;
        imageUrl?: string;
    };
    region: {
        id: string;
        name: string;
        country: string;
    };
    client?: {
        id: string;
        companyName: string;
    };
}

export interface SalesFilter {
    startDate?: string;
    endDate?: string;
    productId?: string;
    regionId?: string;
    userId?: string;
    clientId?: string;
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
    salesByRegion: { regionId: string; regionName: string; revenue: number }[];
}