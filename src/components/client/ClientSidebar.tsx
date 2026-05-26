import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LayoutDashboard, Package, Wrench, User, Building2, Settings, LogOut, ShoppingBag, MessageSquare } from 'lucide-react';

interface ClientSidebarProps {
    isMobile: boolean;
    onClose: () => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ isMobile, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        setTotalUnread(unreadCount);
    }, [unreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (isMobile) onClose();
    };

    const menuItems = [
        { path: '/client/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/client/sales', label: 'Mes ventes', icon: ShoppingBag },
        { path: '/client/equipment', label: 'Mes équipements', icon: Package },
        { path: '/client/maintenance', label: 'Maintenances', icon: Wrench },
        { path: '/client/chat', label: 'Messagerie', icon: MessageSquare },
        { path: '/client/profile', label: 'Mon profil', icon: User },
        { path: '/client/company', label: 'Mon entreprise', icon: Building2 },
        { path: '/client/settings', label: 'Paramètres', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: '#1A3C5E' }}>
            <div className="flex items-center justify-center py-4 md:py-6 px-3 border-b border-white/20">
                <div className="text-center">
                    <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-secondary)', color: '#FFC107' }}>
                        SESMOS
                    </h1>
                    <p className="text-[10px] md:text-xs text-white/60 mt-0.5 md:mt-1 hidden md:block">Smart Equipment & Sales</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 md:py-4 px-2 md:px-3">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    const isChat = item.label === 'Messagerie';
                    const showBadge = isChat && totalUnread > 0;

                    return (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                            className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 group mb-1
                                ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-colors shrink-0 ${active ? 'text-[#FFC107]' : 'text-white/70 group-hover:text-white'}`} />
                            <span className={`font-medium transition-colors text-sm md:text-base truncate ${active ? 'text-[#FFC107]' : 'text-white/80 group-hover:text-white'}`}
                                style={{ fontFamily: 'var(--font-primary)', letterSpacing: '0.02em' }}>
                                {item.label}
                            </span>
                            {showBadge && (
                                <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ backgroundColor: '#FFC107', color: '#1A3C5E' }}>
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="px-2 md:px-3 pb-2 md:pb-3 border-t border-white/20 pt-2 md:pt-3 space-y-1">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group"
                >
                    <LogOut className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white transition-colors shrink-0" />
                    <span className="text-white/70 group-hover:text-white font-medium transition-colors text-sm md:text-base"
                        style={{ fontFamily: 'var(--font-primary)' }}>
                        Déconnexion
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ClientSidebar;