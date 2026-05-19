export interface Client {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    vatNumber: string;
    logoUrl?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    totalSales?: number;
    totalRevenue?: number;
    activeEquipments?: number;
}

export interface ClientRequest {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address?: string;
    taxId?: string;
    vatNumber?: string;
    logoUrl?: string;
}

export interface ClientFilters {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
}