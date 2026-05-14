// types/product.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'CONSTRUCTION' | 'ELECTRICITY' | 'PLUMBING' | 'TOOLS' | 'INDUSTRIAL' | 'AGRICULTURAL' | 'SPARE_PARTS';
    categoryDisplayName?: string;
    imageUrl: string;
    stockQuantity: number;
    minimumStock: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stockQuantity: number;
    minimumStock: number;
    unit: string;
}

export interface ProductCategory {
    name: string;
    displayName: string;
    description: string;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
}

export interface ProductStats {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
}