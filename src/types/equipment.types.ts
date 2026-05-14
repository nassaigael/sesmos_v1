export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'DOWN';

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    status: EquipmentStatus;
    imageUrl: string | null;
    product: { id: string; name: string; category: string; price: number } | null;
    region: { id: string; name: string; country: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface EquipmentRequest {
    name: string;
    serialNumber: string;
    status: EquipmentStatus;
    imageUrl?: string;
    productId: string;
    regionId: string;
}