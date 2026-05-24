export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Maintenance {
    id: string;
    type: string;
    description: string;
    status: MaintenanceStatus;
    startDate: string;
    endDate?: string;
    scheduledDate?: string;
    equipment?: {
        id: string;
        name: string;
        serialNumber: string;
        status: string;
        imageUrl?: string;
    };
    technician?: {
        id: string;
        name: string;
        email: string;
    };
    client?: {
        id: string;
        companyName: string;
    };
    createdAt: string;
}

export interface MaintenanceRequest {
    type: string;
    description: string;
    status: MaintenanceStatus;
    startDate: string;
    endDate?: string;
    equipmentId: string;
    technicianId?: string;
}