export interface Stock {
    id: string;
    quantity: number;
    threshold: number;
    isCritical: boolean;
    product: {
        id: string;
        name: string;
        category: string;
        categoryDisplayName?: string;
        unit: string;
        price: number;
        imageUrl?: string;
        minimumStock: number;
    };
    updatedAt: string;
}

export interface StockRequest {
    quantity: number;
    threshold: number;
}