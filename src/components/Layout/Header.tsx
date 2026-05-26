import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NotificationBell } from '../notifications';
import {
    LogOut, User, Settings, Shield, ShieldAlert, ShieldCheck,
    Plus, Search, Filter, LayoutGrid, X, ChevronRight, MessageSquare
} from 'lucide-react';

interface HeaderProps {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
    currentPage?: 'dashboard' | 'products' | 'sales' | 'users' | 'equipment' | 'stock' | 'maintenance' | 'regions' | 'clients';
    onAdd?: () => void;
    onSearch?: (term: string) => void;
    onFilterToggle?: () => void;
    onViewModeToggle?: () => void;
    showAddButton?: boolean;
    showSearch?: boolean;
    showFilter?: boolean;
    showViewToggle?: boolean;
    viewMode?: 'list' | 'grid' | 'analytics';
    searchValue?: string;
    filterActive?: boolean;
    totalCount?: number;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF',
    danger: '#DC3545'
};

const Header: React.FC<HeaderProps> = ({
    toggleSidebar,
    isMobile,
    currentPage = 'dashboard',
    onAdd,
    onSearch,
    onFilterToggle,
    onViewModeToggle,
    viewMode = 'list',
    showAddButton = false,
    showSearch = false,
    showFilter = false,
    showViewToggle = false,
    searchValue = '',
    filterActive = false,
    totalCount
}) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { lastMessage } = useWebSocket();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);
    const [showCountdown, setShowCountdown] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchValue);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (lastMessage?.type === 'FORCE_LOGOUT') {
            setShowCountdown(true);
            setLogoutCountdown(30);
            const interval = setInterval(() => {
                setLogoutCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setShowCountdown(false);
                        logout();
                        navigate('/login');
                        return null;
                    }
                    return prev ? prev - 1 : null;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [lastMessage, logout, navigate]);

    useEffect(() => {
        setLocalSearchTerm(searchValue);
    }, [searchValue]);

    const handleSearchChange = (value: string) => {
        setLocalSearchTerm(value);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            onSearch?.(value);
        }, 500);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'ADMIN': return '#DC3545';
            case 'MANAGER': return '#F5A623';
            case 'TECHNICIAN': return '#28A745';
            default: return COLORS.primary;
        }
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'ADMIN': return 'Administrateur';
            case 'MANAGER': return 'Manager';
            case 'TECHNICIAN': return 'Technicien';
            default: return role || 'Utilisateur';
        }
    };

    const getRoleIcon = (role?: string) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="w-4 h-4" />;
            case 'MANAGER': return <Shield className="w-4 h-4" />;
            case 'TECHNICIAN': return <ShieldCheck className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'products': return 'Produits';
            case 'sales': return 'Ventes';
            case 'users': return 'Utilisateurs';
            case 'equipment': return 'Équipements';
            case 'stock': return 'Stock';
            case 'maintenance': return 'Maintenance';
            case 'regions': return 'Régions';
            case 'clients': return 'Clients';
            default: return 'Tableau de bord';
        }
    };

    const getPageSubtitle = () => {
        switch (currentPage) {
            case 'products': return 'Gérez votre catalogue de produits';
            case 'sales': return 'Consultez et gérez vos ventes';
            case 'users': return 'Gérez les accès et les rôles';
            case 'equipment': return 'Suivez votre parc matériel';
            case 'stock': return 'Gérez votre inventaire';
            case 'maintenance': return 'Planifiez vos interventions';
            case 'regions': return 'Gérez les régions et leurs coordonnées';
            case 'clients': return 'Gérez vos clients et leurs informations';
            default: return 'Vue d\'ensemble de votre activité';
        }
    };

    return (
        <>
            {showCountdown && logoutCountdown !== null && (
                <div className="fixed top-0 left-0 right-0 z-50 p-3 text-center text-white font-semibold shadow-lg animate-pulse" style={{ backgroundColor: COLORS.danger }}>
                    ⚠️ Votre compte a été bloqué par un administrateur. Déconnexion automatique dans {logoutCountdown} secondes...
                </div>
            )}

            <header className="sticky top-0 z-20 bg-white border-b shadow-sm" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
                <div className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4">
                            {isMobile && (
                                <button onClick={toggleSidebar} className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-lg md:text-2xl font-bold truncate" style={{ color: COLORS.primary, fontFamily: 'var(--font-secondary)' }}>
                                    {getPageTitle()}
                                </h1>
                                <p className="text-xs hidden md:block truncate" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                    {getPageSubtitle()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-4">
                            {showAddButton && onAdd && (
                                <button onClick={onAdd} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-white transition-colors hover:opacity-90 text-sm md:text-base" style={{ backgroundColor: COLORS.primary }}>
                                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Nouveau</span>
                                </button>
                            )}

                            {showViewToggle && currentPage === 'sales' && onViewModeToggle && (
                                <button onClick={onViewModeToggle} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:bg-gray-100" style={{ backgroundColor: 'rgba(26, 60, 94, 0.05)' }}>
                                    <span className={`transition-all duration-300 ${viewMode === 'list' ? 'text-[#FFC107] font-semibold' : 'text-gray-500'}`}>Ventes</span>
                                    <span className="text-gray-300 text-xs md:text-sm">|</span>
                                    <span className={`transition-all duration-300 ${viewMode === 'analytics' ? 'text-[#FFC107] font-semibold' : 'text-gray-500'}`}>Analyses</span>
                                </button>
                            )}

                            {showViewToggle && currentPage !== 'sales' && onViewModeToggle && (
                                <button onClick={onViewModeToggle} className={`p-1.5 md:p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'text-white shadow-sm' : 'hover:bg-gray-100'}`} style={viewMode === 'grid' ? { backgroundColor: COLORS.primary } : { color: COLORS.primary }}>
                                    <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                            )}

                            <NotificationBell />

                            <div className="relative" ref={profileRef}>
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-1 md:gap-3 p-1 rounded-lg transition-all duration-200 hover:bg-gray-100 group">
                                    <div className="relative">
                                        {user?.imageUrl && !imageError ? (
                                            <img src={user.imageUrl} alt={user.name || 'Avatar'} className="w-7 h-7 md:w-10 md:h-10 rounded-full object-cover border-2 transition-all group-hover:scale-105" style={{ borderColor: COLORS.accent }} onError={() => setImageError(true)} />
                                        ) : (
                                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-base transition-all group-hover:scale-105" style={{ backgroundColor: getRoleColor(user?.role) }}>
                                                {user?.name ? getInitials(user.name) : 'U'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white" style={{ backgroundColor: COLORS.accent }} />
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium truncate max-w-30" style={{ color: COLORS.primary }}>{user?.name || 'Utilisateur'}</p>
                                        <p className="text-xs flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                            {getRoleIcon(user?.role)}
                                            {getRoleLabel(user?.role)}
                                        </p>
                                    </div>
                                    <svg className={`hidden md:block w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50 border animate-fadeInUp" style={{ borderColor: COLORS.border }}>
                                        <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                                            <div className="flex items-center gap-3">
                                                {user?.imageUrl && !imageError ? (
                                                    <img src={user.imageUrl} alt={user.name || 'Avatar'} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: COLORS.accent }} />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: getRoleColor(user?.role) }}>
                                                        {user?.name ? getInitials(user.name) : 'U'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold" style={{ color: COLORS.primary }}>{user?.name || 'Utilisateur'}</p>
                                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{user?.email || ''}</p>
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${getRoleColor(user?.role)}15`, color: getRoleColor(user?.role) }}>
                                                        {getRoleIcon(user?.role)}
                                                        {getRoleLabel(user?.role)}
                                                    </span>
                                                </div>
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                                    <User className="w-3 h-3" style={{ color: COLORS.primary }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                    <User className="w-4 h-4" style={{ color: COLORS.accent }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mon profil</p>
                                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Gérer vos informations</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                            </button>

                                            <button onClick={() => { navigate('/chat'); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                                    <MessageSquare className="w-4 h-4" style={{ color: COLORS.accent }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Messagerie</p>
                                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Vos conversations</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
                                            </button>

                                            <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group">
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

                                        <div className="border-t" style={{ borderColor: COLORS.border }} />

                                        <div className="py-2">
                                            <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left transition-colors hover:bg-red-50 flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-red-100" style={{ backgroundColor: '#DC354515' }}>
                                                    <LogOut className="w-4 h-4" style={{ color: COLORS.danger }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium" style={{ color: COLORS.danger }}>Déconnexion</p>
                                                    <p className="text-xs" style={{ color: COLORS.danger, opacity: 0.7 }}>Quitter l'application</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.danger }} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(showSearch || showFilter) && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3 md:mt-4 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                            {showSearch && (
                                <div className="flex-1 w-full sm:max-w-md relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.5 }} />
                                    <input type="text" placeholder="Rechercher..." value={localSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm" style={{ borderColor: COLORS.border }} onFocus={(e) => e.target.style.borderColor = COLORS.accent} onBlur={(e) => e.target.style.borderColor = COLORS.border} />
                                    {localSearchTerm && (
                                        <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {showFilter && onFilterToggle && (
                                    <button onClick={onFilterToggle} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${filterActive ? 'text-white' : 'hover:bg-gray-50'}`} style={filterActive ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : { borderColor: COLORS.border }}>
                                        <Filter className="w-4 h-4" />
                                        <span className="text-sm">Filtres</span>
                                        {filterActive && <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse" />}
                                    </button>
                                )}
                                {totalCount !== undefined && (
                                    <div className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        {totalCount} résultat{totalCount > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;