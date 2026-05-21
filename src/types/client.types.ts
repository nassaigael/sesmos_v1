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

export interface CreateClientUserRequest {
    email: string;
    password: string;
    name: string;
}

export interface ClientUserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    accountNonLocked: boolean;
    clientId: string;
    imageUrl?: string;
    clientName: string;
}