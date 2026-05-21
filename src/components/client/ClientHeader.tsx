import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings, Building2, UserCircle, HelpCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';

interface ClientHeaderProps {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA'
};

const ClientHeader: React.FC<ClientHeaderProps> = ({ toggleSidebar, sidebarOpen, isMobile }) => {
    const { user, logout } = useAuth();
    const { clientData } = useClientAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [notifications] = useState([
        { id: 1, title: 'Maintenance programmée', message: 'Votre équipement sera maintenu demain', time: 'Il y a 2 heures', read: false, type: 'warning' },
        { id: 2, title: 'Nouvelle mise à jour', message: 'Une nouvelle version est disponible', time: 'Il y a 1 jour', read: true, type: 'info' },
    ]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleColor = () => {
        return COLORS.accent;
    };

    const getRoleLabel = () => {
        return 'Client';
    };

    const getRoleIcon = () => {
        return <UserCircle className="w-4 h-4" />;
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const getPageTitle = () => {
        const path = window.location.pathname;
        if (path === '/client/dashboard') return 'Tableau de bord';
        if (path === '/client/sales') return 'Mes ventes';
        if (path === '/client/equipment') return 'Mes équipements';
        if (path === '/client/maintenance') return 'Maintenances';
        if (path === '/client/profile') return 'Mon profil';
        if (path === '/client/company') return 'Mon entreprise';
        if (path === '/client/settings') return 'Paramètres';
        return 'Espace client';
    };

    const getPageSubtitle = () => {
        const path = window.location.pathname;
        if (path === '/client/dashboard') return 'Vue d\'ensemble de votre activité';
        if (path === '/client/sales') return 'Historique de vos achats';
        if (path === '/client/equipment') return 'Suivez votre parc matériel';
        if (path === '/client/maintenance') return 'Planifiez vos interventions';
        if (path === '/client/profile') return 'Gérez vos informations personnelles';
        if (path === '/client/company') return 'Gérez les informations de votre entreprise';
        if (path === '/client/settings') return 'Personnalisez votre expérience';
        return clientData?.companyName || 'Gérez votre espace client';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
            <div className="px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isMobile && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none"
                                aria-label={sidebarOpen ? 'Fermer menu' : 'Ouvrir menu'}
                            >
                                <Menu className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold" style={{ color: COLORS.primary, fontFamily: 'var(--font-secondary)' }}>
                                {getPageTitle()}
                            </h1>
                            <p className="text-sm hidden md:block" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                {getPageSubtitle()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 md:w-6 md:h-6" style={{ color: COLORS.primary }} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
                                        style={{ backgroundColor: '#DC3545' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50 border" style={{ borderColor: COLORS.border }}>
                                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                                        <h3 className="font-semibold" style={{ color: COLORS.primary }}>Notifications</h3>
                                        <button className="text-xs" style={{ color: COLORS.accent }}>Tout marquer comme lu</button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" style={{ color: COLORS.primary }} />
                                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucune notification</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-yellow-50/30' : ''}`} style={{ borderColor: COLORS.border }}>
                                                    <div className="flex gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{notif.title}</p>
                                                            <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>{notif.message}</p>
                                                            <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{notif.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 border-t text-center" style={{ borderColor: COLORS.border }}>
                                        <button className="text-xs font-medium flex items-center justify-center gap-1 mx-auto" style={{ color: COLORS.accent }}>
                                            Voir toutes les notifications
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 group"
                            >
                                <div className="relative">
                                    {clientData?.logoUrl && !imageError ? (
                                        <img
                                            src={clientData.logoUrl}
                                            alt={clientData.companyName || 'Avatar'}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 transition-all group-hover:scale-105"
                                            style={{ borderColor: COLORS.accent }}
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base transition-all group-hover:scale-105"
                                            style={{ backgroundColor: getRoleColor() }}
                                        >
                                            {clientData?.companyName ? getInitials(clientData.companyName) : 'C'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#10B981' }} />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{user?.name || 'Client'}</p>
                                    <p className="text-xs flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                        {getRoleIcon()}
                                        {getRoleLabel()}
                                    </p>
                                </div>
                                <svg
                                    className={`hidden md:block w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: COLORS.primary, opacity: 0.6 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50 border animate-fadeInUp" style={{ borderColor: COLORS.border }}>
                                    {/* Header with user info */}
                                    <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                                        <div className="flex items-center gap-3">
                                            {clientData?.logoUrl && !imageError ? (
                                                <img
                                                    src={clientData.logoUrl}
                                                    alt={clientData.companyName || 'Avatar'}
                                                    className="w-12 h-12 rounded-full object-cover border-2"
                                                    style={{ borderColor: COLORS.accent }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                                    style={{ backgroundColor: getRoleColor() }}
                                                >
                                                    {clientData?.companyName ? getInitials(clientData.companyName) : 'C'}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold" style={{ color: COLORS.primary }}>{user?.name || 'Client'}</p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{user?.email || ''}</p>
                                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${getRoleColor()}15`, color: getRoleColor() }}>
                                                    {getRoleIcon()}
                                                    {getRoleLabel()}
                                                </span>
                                            </div>
                                            <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => { window.location.href = '/client/profile'; setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                <User className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mon profil</p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Gérer vos informations</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                        </button>

                                        <button
                                            onClick={() => { window.location.href = '/client/company'; setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                <Building2 className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mon entreprise</p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Informations société</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                        </button>

                                        <button
                                            onClick={() => { window.location.href = '/client/settings'; setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                <Settings className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Paramètres</p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Préférences</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t" style={{ borderColor: COLORS.border }} />

                                    {/* Help section */}
                                    <div className="py-2">
                                        <button
                                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                <HelpCircle className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Aide et support</p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Documentation</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t" style={{ borderColor: COLORS.border }} />

                                    {/* Logout */}
                                    <div className="py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-red-50 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-red-100" style={{ backgroundColor: '#DC354515' }}>
                                                <LogOut className="w-4 h-4" style={{ color: '#DC3545' }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: '#DC3545' }}>Déconnexion</p>
                                                <p className="text-xs" style={{ color: '#DC3545', opacity: 0.7 }}>Quitter l'application</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-40" style={{ color: '#DC3545' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ClientHeader;