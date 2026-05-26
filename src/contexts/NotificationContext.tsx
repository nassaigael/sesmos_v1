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
        console.log('📊 Unread count updated:', notifications.filter(n => !n.read).length);
    }, [notifications]);

    const loadNotifications = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        console.log('📂 Loading notifications from localStorage:', saved);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const notificationsWithDates = parsed.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.createdAt)
                }));
                setNotifications(notificationsWithDates);
                console.log('✅ Loaded', notificationsWithDates.length, 'notifications');
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]);
            }
        } else {
            console.log('📂 No notifications found in localStorage');
        }
    };


    const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        console.log('🔔 Adding notification:', notification);

        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            read: false,
            createdAt: new Date()
        };

        console.log('🔔 New notification object:', newNotification);

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            const limited = updated.slice(0, 100);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
            console.log('🔔 Notifications updated, total:', limited.length);
            return limited;
        });

        try {
            const audio = new Audio('/notification.wav');
            audio.play().catch((e) => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio not supported');
        }

        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
    };

    const markAsRead = (id: string) => {
        console.log('📖 Marking notification as read:', id);
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const markAllAsRead = () => {
        console.log('📖 Marking all notifications as read');
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const removeNotification = (id: string) => {
        console.log('🗑 Removing notification:', id);
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearAllNotifications = () => {
        console.log('🗑 Clearing all notifications');
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