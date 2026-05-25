import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

interface SidebarProps {
    isMobile: boolean;
    onClose: () => void;
}

interface MenuItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (isMobile) onClose();
    };

    const menuItems: MenuItem[] = [
        {
            path: '/dashboard',
            label: 'Tableau de bord',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            path: '/sales',
            label: 'Ventes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        {
            path: '/products',
            label: 'Produits',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            path: '/stock',
            label: 'Stock',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            )
        },
        {
            path: '/equipment',
            label: 'Équipements',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            path: '/maintenance',
            label: 'Maintenance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            path: '/regions',
            label: 'Régions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            roles: ['ADMIN', 'MANAGER']
        },
        {
            path: '/clients',
            label: 'Clients',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            roles: ['ADMIN', 'MANAGER']
        },
        {
            path: '/users',
            label: 'Utilisateurs',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            roles: ['ADMIN']
        },
        {
            path: '/chat',
            label: 'Chat',
            icon: <MessageSquare className="w-5 h-5" />,
            roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'CLIENT']
        }
    ];

    const bottomItems: MenuItem[] = [
        {
            path: '/profile',
            label: 'Mon Profil',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            path: '/settings',
            label: 'Paramètres',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            roles: ['ADMIN']
        }
    ];

    const userRole = user?.role || (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').role; } catch { return null; }
    })();

    const filteredMenuItems = userRole === 'ADMIN'
        ? menuItems
        : menuItems.filter(item => !item.roles || item.roles.includes(userRole));

    const filteredBottomItems = userRole === 'ADMIN'
        ? bottomItems
        : bottomItems.filter(item => !item.roles || item.roles.includes(userRole));

    const isActive = (path: string) =>
        location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-center py-6 border-b border-white/20">
                <div className="text-center">
                    <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-secondary)', color: '#FFC107' }}>
                        SESMOS
                    </h1>
                    <p className="text-xs text-white/60 mt-1">Smart Equipment & Sales</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {filteredMenuItems.map(item => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mb-1
                                ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <span className={`transition-colors ${active ? 'text-[#F5A623]' : 'text-white/70 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span className={`font-medium transition-colors ${active ? 'text-[#F5A623]' : 'text-white/80 group-hover:text-white'}`}
                                style={{ fontFamily: 'var(--font-primary)', fontSize: '14px', letterSpacing: '0.02em' }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="px-3 pb-3 border-t border-white/20 pt-3 space-y-1">
                {filteredBottomItems.map(item => {
                    const active = isActive(item.path);
                    return (
                        <button key={item.path}
                            onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
                                ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                            <span className={`transition-colors ${active ? 'text-[#F5A623]' : 'text-white/60 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span className={`font-medium transition-colors ${active ? 'text-[#F5A623]' : 'text-white/70 group-hover:text-white'}`}
                                style={{ fontFamily: 'var(--font-primary)', fontSize: '14px' }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}

                <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-white/70 group-hover:text-white font-medium transition-colors"
                        style={{ fontFamily: 'var(--font-primary)', fontSize: '14px' }}>
                        Déconnexion
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;