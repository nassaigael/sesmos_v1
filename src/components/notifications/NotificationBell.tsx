import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationList from './NotificationList';

interface NotificationBellProps {
    className?: string;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleViewAll = () => {
        navigate('/chat');
        setShowNotifications(false);
    };

    return (
        <div className={`relative ${className}`} ref={notificationRef}>
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 md:w-6 md:h-6" style={{ color: COLORS.primary }} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-white text-xs flex items-center justify-center px-1 animate-pulse"
                        style={{ backgroundColor: COLORS.accent, color: COLORS.primary, fontWeight: 'bold' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 z-50"
                    >
                        <NotificationList onViewAll={handleViewAll} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;