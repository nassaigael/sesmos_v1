import React from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationListProps {
    onViewAll?: () => void;
    onClose?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    danger: '#DC3545',
    success: '#28A745',
    gray: '#6C757D'
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'message':
            return <MessageSquare className="w-4 h-4" />;
        case 'mention':
            return <Bell className="w-4 h-4" />;
        default:
            return <Bell className="w-4 h-4" />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'message':
            return COLORS.accent;
        case 'mention':
            return COLORS.success;
        default:
            return COLORS.primary;
    }
};

const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    return `${days} j`;
};

const NotificationList: React.FC<NotificationListProps> = ({ onViewAll, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.roomId && onViewAll) {
            onViewAll();
        }
        if (onClose) onClose();
    };

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
                <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold" style={{ color: COLORS.primary }}>Notifications</h3>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>0 non lue</p>
                </div>
                <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucune notification</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                <div>
                    <h3 className="font-semibold" style={{ color: COLORS.primary }}>Notifications</h3>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-gray-100"
                        style={{ color: COLORS.accent }}
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                    <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-4 text-left transition-all hover:bg-gray-50 border-b last:border-b-0 ${!notification.read ? 'bg-yellow-50/30' : ''
                            }`}
                        style={{ borderColor: COLORS.border }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${getNotificationColor(notification.type)}15` }}
                            >
                                <div style={{ color: getNotificationColor(notification.type) }}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                        {notification.title}
                                    </p>
                                    <span className="text-xs shrink-0" style={{ color: COLORS.primary, opacity: 0.4 }}>
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                    {notification.message}
                                </p>
                                {notification.user && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {notification.user.imageUrl ? (
                                            <img
                                                src={notification.user.imageUrl}
                                                alt=""
                                                className="w-4 h-4 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-medium"
                                                style={{ backgroundColor: COLORS.primary }}
                                            >
                                                {getInitials(notification.user.name)}
                                            </div>
                                        )}
                                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                            {notification.user.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: COLORS.accent }} />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {onViewAll && (
                <div className="p-3 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={onViewAll}
                        className="w-full text-center text-sm py-2 rounded-lg transition-all hover:bg-gray-100"
                        style={{ color: COLORS.accent }}
                    >
                        Voir toutes les conversations
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationList;