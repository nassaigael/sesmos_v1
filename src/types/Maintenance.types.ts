export type MaintenanceStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export interface Maintenance {
    id: string;
    type: string;
    description: string;
    status: MaintenanceStatus;
    startDate: string;
    endDate?: string;
    equipment?: {
        id: string;
        name: string;
        serialNumber: string;
        status: string;
    };
    technician?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
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