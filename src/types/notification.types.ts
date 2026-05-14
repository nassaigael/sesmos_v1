// types/notification.types.ts
export interface NotificationResponse {
    id: string;
    message: string;
    type: 'SALE_ALERT' | 'EQUIPMENT_DOWN' | 'STOCK_CRITICAL' | 'MAINTENANCE_UPDATE';
    isRead: boolean;
    createdAt: string;
    userId?: string;
}