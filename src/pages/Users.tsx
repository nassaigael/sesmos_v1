import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import UserCard from '../components/users/UserCard';
import UserForm from '../components/users/UserForm';
import type { User as UserType, UserFilters, UserStats } from '../types/user';
import { User, ShieldCheck, ShieldAlert, Shield, Edit, Unlock, LockIcon, Trash2, RefreshCw, WifiOff, Users as UsersIcon, Building2 } from 'lucide-react';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

type ViewMode = 'grid' | 'list';
type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'CLIENT';
type UserTypeFilter = 'all' | 'internal' | 'client' | 'locked' | 'admin';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#1A3C5E',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const getRoleLabel = (role: UserRole | string) => {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'MANAGER': return 'Manager';
        case 'TECHNICIAN': return 'Technicien';
        case 'CLIENT': return 'Client';
        default: return role;
    }
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getRoleColor = (role: UserRole | string) => {
    switch (role) {
        case 'ADMIN': return '#DC3545';
        case 'MANAGER': return '#F5A623';
        case 'TECHNICIAN': return '#28A745';
        case 'CLIENT': return '#1A3C5E';
        default: return '#1A3C5E';
    }
};

const Users: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const { refreshUser, user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<UserFilters>({});
    const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('userViewMode');
        return (saved === 'grid' || saved === 'list') ? saved : 'grid';
    });
    const [, setRetryCount] = useState(0);
    const [isTimeout, setIsTimeout] = useState(false);

    const isLoadingRef = useRef(false);
    const initialLoadDone = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearLoadingTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const loadUsers = useCallback(async () => {
        if (isLoadingRef.current) return;

        clearLoadingTimeout();
        setIsTimeout(false);

        timeoutRef.current = setTimeout(() => {
            setIsTimeout(true);
        }, 15000);

        try {
            isLoadingRef.current = true;
            setLoading(true);
            setError(null);

            let response;

            if (userTypeFilter === 'locked') {
                const allUsers = await userService.getAllUsers();
                const lockedUsers = allUsers.filter(u => !u.accountNonLocked);
                setUsers(lockedUsers);
                setTotalElements(lockedUsers.length);
                setTotalPages(1);
                setLoading(false);
                isLoadingRef.current = false;
                clearLoadingTimeout();
                return;
            }

            if (userTypeFilter === 'admin') {
                const allUsers = await userService.getAllUsers();
                const adminUsers = allUsers.filter(u => u.role === 'ADMIN');
                setUsers(adminUsers);
                setTotalElements(adminUsers.length);
                setTotalPages(1);
                setLoading(false);
                isLoadingRef.current = false;
                clearLoadingTimeout();
                return;
            }

            const filterParams: UserFilters = {};
            if (searchTerm && searchTerm.trim()) {
                filterParams.search = searchTerm.trim();
            }
            if (filters.role && userTypeFilter === 'all') {
                filterParams.role = filters.role;
            }
            if (filters.status) {
                filterParams.status = filters.status;
            }

            response = await userService.getUsersWithFilters(filterParams, page, 20);

            if (response && response.content) {
                let filteredContent = response.content;

                if (userTypeFilter === 'internal') {
                    filteredContent = response.content.filter((u: UserType) => u.role !== 'CLIENT');
                } else if (userTypeFilter === 'client') {
                    filteredContent = response.content.filter((u: UserType) => u.role === 'CLIENT');
                }

                setUsers(filteredContent);
                setTotalPages(response.totalPages);
                setTotalElements(filteredContent.length);
            } else {
                setUsers([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Impossible de charger la liste des utilisateurs');
            setUsers([]);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
            clearLoadingTimeout();
        }
    }, [page, searchTerm, filters.role, filters.status, userTypeFilter]);

    const loadStats = useCallback(async () => {
        try {
            const data = await userService.getStats();
            const allUsers = await userService.getAllUsers();
            const clientCount = allUsers.filter(u => u.role === 'CLIENT').length;
            const lockedCount = allUsers.filter(u => !u.accountNonLocked).length;
            const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
            setStats({
                ...data,
                lockedUsers: lockedCount,
                byRole: {
                    ...data.byRole,
                    CLIENT: clientCount,
                    ADMIN: adminCount
                }
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }, []);

    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadUsers();
            loadStats();
        }
    }, [loadUsers, loadStats]);

    useEffect(() => {
        if (initialLoadDone.current) {
            loadUsers();
        }
    }, [page, searchTerm, filters.role, filters.status, userTypeFilter, loadUsers]);

    const handleRefresh = () => {
        setRetryCount(prev => prev + 1);
        setPage(0);
        setUserTypeFilter('all');
        setFilters({});
        setSearchTerm('');
        loadUsers();
        loadStats();
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('userViewMode', mode);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setShowForm(true);
    };

    const handleEdit = (user: UserType) => {
        setSelectedUser(user);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await userService.deleteUser(id);

            if (currentUser && currentUser.id === id) {
                const { logout } = useAuth();
                logout();
                window.location.href = '/login';
                return;
            }

            await loadUsers();
            await loadStats();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleLock = async (id: string) => {
        try {
            await userService.lockUser(id);

            if (currentUser && currentUser.id === id) {
                await refreshUser();
            }

            await loadUsers();
            await loadStats();
        } catch (error) {
            console.error('Error locking user:', error);
        }
    };

    const handleUnlock = async (id: string) => {
        try {
            await userService.unlockUser(id);

            if (currentUser && currentUser.id === id) {
                await refreshUser();
            }

            await loadUsers();
            await loadStats();
        } catch (error) {
            console.error('Error unlocking user:', error);
        }
    };

    const handleRoleChange = (value: string) => {
        if (value === '') {
            setFilters(prev => ({ ...prev, role: undefined }));
        } else {
            setFilters(prev => ({ ...prev, role: value as UserRole }));
        }
        setPage(0);
    };

    const handleStatusChange = (value: string) => {
        if (value === '') {
            setFilters(prev => ({ ...prev, status: undefined }));
        } else {
            setFilters(prev => ({ ...prev, status: value as 'active' | 'locked' }));
        }
        setPage(0);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(0);
    };

    const handleCardClick = (filterType: UserTypeFilter) => {
        setUserTypeFilter(filterType);
        setPage(0);
        setFilters({});
        setSearchTerm('');
    };

    const getFilterCount = () => {
        let count = 0;
        if (filters.role) count++;
        if (filters.status) count++;
        if (userTypeFilter !== 'all') count++;
        return count;
    };

    const resetFilters = () => {
        setFilters({});
        setSearchTerm('');
        setUserTypeFilter('all');
        setPage(0);
    };

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
            <div className="relative flex justify-center -mt-12">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
            </div>
            <div className="p-4 pt-6">
                <div className="text-center mb-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="mb-4 p-2.5 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                </div>
                <div className="flex items-center justify-center gap-1 mb-5">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex flex-col items-center gap-1 py-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (error && !loading && users.length === 0) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
                <Header
                    toggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    currentPage="users"
                    onAdd={handleAddUser}
                    onSearch={handleSearch}
                    onFilterToggle={() => setShowFilters(!showFilters)}
                    onViewModeToggle={() => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
                    showAddButton={true}
                    showSearch={true}
                    showFilter={true}
                    showViewToggle={true}
                    viewMode={viewMode}
                    searchValue={searchTerm}
                    filterActive={showFilters}
                    totalCount={totalElements}
                />
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="bg-white rounded-xl p-8 text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                            <ShieldAlert className="w-10 h-10" style={{ color: COLORS.warning }} />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Erreur de chargement</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button onClick={handleRefresh} className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90 flex items-center gap-2 mx-auto" style={{ backgroundColor: COLORS.primary }}>
                            <RefreshCw className="w-4 h-4" />
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="users"
                onAdd={handleAddUser}
                onSearch={handleSearch}
                onFilterToggle={() => setShowFilters(!showFilters)}
                onViewModeToggle={() => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
                showAddButton={true}
                showSearch={true}
                showFilter={true}
                showViewToggle={true}
                viewMode={viewMode}
                searchValue={searchTerm}
                filterActive={showFilters}
                totalCount={totalElements}
            />

            <div className="p-4 md:p-6">
                {/* KPI Cards - Toutes cliquables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Total utilisateurs */}
                    <div
                        className="bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleCardClick('all')}
                        style={{ border: userTypeFilter === 'all' ? `2px solid ${COLORS.warning}` : 'none' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>Total utilisateurs</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats?.totalUsers ?? 0}</p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.borderLight }}>
                                <UsersIcon className="w-5 h-5" style={{ color: COLORS.primary }} />
                            </div>
                        </div>
                    </div>

                    {/* Utilisateurs internes */}
                    <div
                        className="bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleCardClick('internal')}
                        style={{ border: userTypeFilter === 'internal' ? `2px solid ${COLORS.warning}` : 'none' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>Utilisateurs internes</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>
                                    {(stats?.totalUsers ?? 0) - (stats?.byRole?.CLIENT ?? 0)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: `${COLORS.warning}15` }}>
                                <Shield className="w-5 h-5" style={{ color: COLORS.warning }} />
                            </div>
                        </div>
                    </div>

                    {/* Clients */}
                    <div
                        className="bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleCardClick('client')}
                        style={{ border: userTypeFilter === 'client' ? `2px solid ${COLORS.warning}` : 'none' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>Clients</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.warning }}>{stats?.byRole?.CLIENT ?? 0}</p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: `${COLORS.warning}15` }}>
                                <Building2 className="w-5 h-5" style={{ color: COLORS.warning }} />
                            </div>
                        </div>
                    </div>

                    {/* Comptes bloqués - cliquable */}
                    <div
                        className="bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleCardClick('locked')}
                        style={{ border: userTypeFilter === 'locked' ? `2px solid ${COLORS.warning}` : 'none' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>Comptes bloqués</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: '#DC3545' }}>{stats?.lockedUsers ?? 0}</p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: '#DC354515' }}>
                                <ShieldAlert className="w-5 h-5" style={{ color: '#DC3545' }} />
                            </div>
                        </div>
                    </div>

                    {/* Administrateurs - cliquable */}
                    <div
                        className="bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleCardClick('admin')}
                        style={{ border: userTypeFilter === 'admin' ? `2px solid ${COLORS.warning}` : 'none' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>Administrateurs</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.warning }}>{stats?.byRole?.ADMIN ?? 0}</p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: `${COLORS.warning}15` }}>
                                <ShieldCheck className="w-5 h-5" style={{ color: COLORS.warning }} />
                            </div>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-6 p-4 rounded-xl border bg-white" style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.text, opacity: 0.7 }}>Rôle</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ borderColor: COLORS.border }}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    value={filters.role || ''}
                                    disabled={userTypeFilter !== 'all'}
                                >
                                    <option value="">Tous les rôles</option>
                                    <option value="ADMIN">Administrateur</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="TECHNICIAN">Technicien</option>
                                    <option value="CLIENT">Client</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.text, opacity: 0.7 }}>Statut</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ borderColor: COLORS.border }}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    value={filters.status || ''}
                                    disabled={userTypeFilter !== 'all'}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="active">Actif</option>
                                    <option value="locked">Bloqué</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button onClick={resetFilters} className="w-full px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        </div>

                        {getFilterCount() > 0 && (
                            <div className="mt-3 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: COLORS.border }}>
                                <span className="text-xs" style={{ color: COLORS.text, opacity: 0.5 }}>Filtres actifs :</span>
                                {userTypeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}>
                                        {userTypeFilter === 'internal' ? 'Utilisateurs internes' :
                                            userTypeFilter === 'client' ? 'Clients' :
                                                userTypeFilter === 'locked' ? 'Comptes bloqués' :
                                                    userTypeFilter === 'admin' ? 'Administrateurs' : 'Tous'}
                                        <button onClick={() => handleCardClick('all')} className="ml-1 hover:opacity-70">×</button>
                                    </span>
                                )}
                                {filters.role && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}>
                                        Rôle: {getRoleLabel(filters.role)}
                                        <button onClick={() => handleRoleChange('')} className="ml-1 hover:opacity-70">×</button>
                                    </span>
                                )}
                                {filters.status && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}>
                                        Statut: {filters.status === 'active' ? 'Actif' : 'Bloqué'}
                                        <button onClick={() => handleStatusChange('')} className="ml-1 hover:opacity-70">×</button>
                                    </span>
                                )}
                                {getFilterCount() > 1 && (
                                    <button onClick={resetFilters} className="text-xs" style={{ color: COLORS.warning }}>Tout effacer</button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {searchTerm && !loading && users.length > 0 && (
                    <div className="mb-4 text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                        {totalElements} résultat{totalElements > 1 ? 's' : ''} pour "{searchTerm}"
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isTimeout ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
                                    <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
                                    <div className="relative flex justify-center -mt-12">
                                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                                            <WifiOff className="w-10 h-10" style={{ color: COLORS.warning, opacity: 0.6 }} />
                                        </div>
                                    </div>
                                    <div className="p-4 pt-6 text-center">
                                        <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                                        <div className="h-10 bg-gray-200 rounded w-28 mx-auto"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                        )}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-md">
                            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
                            <div className="relative flex justify-center -mt-12">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                                    {searchTerm ? (
                                        <svg className="w-10 h-10" style={{ color: COLORS.warning, opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-10 h-10" style={{ color: COLORS.primary, opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 pt-6 text-center">
                                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>
                                    {searchTerm ? 'Aucun résultat trouvé' : 'Aucun utilisateur'}
                                </h3>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                    {searchTerm
                                        ? `Aucun utilisateur ne correspond à "${searchTerm}"`
                                        : 'Aucun utilisateur n\'est actuellement enregistré'}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 px-4 py-2 rounded-lg border flex items-center gap-2 mx-auto text-sm"
                                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                    >
                                        Effacer la recherche
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onLock={handleLock}
                                onUnlock={handleUnlock}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                        <table className="w-full">
                            <thead className="border-b" style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text }}>Utilisateur</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text }}>Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text }}>Rôle</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text }}>Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text }}>Date d'inscription</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: COLORS.text }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.imageUrl ? (
                                                    <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: getRoleColor(user.role) }}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                )}
                                                <span className="font-medium" style={{ color: COLORS.text }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.text }}>{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${getRoleColor(user.role)}15`, color: getRoleColor(user.role) }}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.accountNonLocked ? 'bg-yellow-100' : 'bg-gray-100'}`} style={{ color: user.accountNonLocked ? COLORS.warning : COLORS.primary, opacity: 0.8 }}>
                                                {user.accountNonLocked ? 'Actif' : 'Bloqué'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.text }}>
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEdit(user)} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: COLORS.warning }}>
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {!user.accountNonLocked ? (
                                                    <button onClick={() => handleUnlock(user.id)} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: COLORS.warning }}>
                                                        <Unlock className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleLock(user.id)} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: COLORS.warning }}>
                                                        <LockIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(user.id)} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-6">
                        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                            ◀ Précédent
                        </button>
                        <span className="text-sm" style={{ color: COLORS.text }}>Page {page + 1} / {totalPages}</span>
                        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                            Suivant ▶
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <UserForm
                    isOpen={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        if (selectedUser && currentUser && selectedUser.id === currentUser.id) {
                            refreshUser();
                        }
                        handleRefresh();
                    }}
                    editUser={selectedUser || undefined}
                />
            )}
        </div>
    );
};

export default Users;