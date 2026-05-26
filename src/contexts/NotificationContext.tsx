import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'message' | 'mention' | 'system';
    user?: {
        name: string;
        imageUrl?: string;
    };
    roomId?: string;
    read: boolean;
    createdAt: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'chat_notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const loadNotifications = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const notificationsWithDates = parsed.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.createdAt)
                }));
                setNotifications(notificationsWithDates);
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]);
            }
        }
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            read: false,
            createdAt: new Date()
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            const limited = updated.slice(0, 100);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
            return limited;
        });

        try {
            const audio = new Audio('/notification.wav');
            audio.play().catch(() => { });
        } catch (e) { }

        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};