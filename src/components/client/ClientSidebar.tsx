import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Wrench, User, Building2, Settings, LogOut, ShoppingBag, MessageSquare } from 'lucide-react';

interface ClientSidebarProps {
    isMobile: boolean;
    onClose: () => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ isMobile, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

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
            <div className="flex items-center justify-center py-6 border-b border-white/20">
                <div className="text-center">
                    <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-secondary)', color: '#FFC107' }}>
                        SESMOS
                    </h1>
                    <p className="text-xs text-white/60 mt-1">Smart Equipment & Sales</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mb-1
                                ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#FFC107]' : 'text-white/70 group-hover:text-white'}`} />
                            <span className={`font-medium transition-colors ${active ? 'text-[#FFC107]' : 'text-white/80 group-hover:text-white'}`}
                                style={{ fontFamily: 'var(--font-primary)', fontSize: '14px', letterSpacing: '0.02em' }}>
                                {item.label}
                            </span>
                            {item.label === 'Messagerie' && (
                                <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ backgroundColor: '#FFC107', color: '#1A3C5E' }}>
                                    0
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="px-3 pb-3 border-t border-white/20 pt-3 space-y-1">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group"
                >
                    <LogOut className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                    <span className="text-white/70 group-hover:text-white font-medium transition-colors"
                        style={{ fontFamily: 'var(--font-primary)', fontSize: '14px' }}>
                        Déconnexion
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ClientSidebar;