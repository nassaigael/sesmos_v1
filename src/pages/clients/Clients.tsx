import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import ClientCard from '../../components/client/ClientCard';
import ClientForm from '../../components/client/ClientForm';
import ClientDetail from '../../components/client/ClientDetail';
import clientService from '../../services/clientService';
import type { Client } from '../../types/client.types';
import { Building2, Users, Package, Search, FilterX } from 'lucide-react';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA',
    white: '#FFFFFF'
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }} />
        <div className="relative flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
        </div>
        <div className="p-4 pt-6">
            <div className="text-center mb-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="flex gap-2 pt-2">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC<{ searchTerm?: string; onClear?: () => void; onAdd?: () => void }> =
    ({ searchTerm, onClear, onAdd }) => {
        if (searchTerm) {
            return (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }} />
                    <div className="relative flex justify-center -mt-12">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                            <Search className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className="p-6 pt-6 text-center">
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun résultat trouvé</h3>
                        <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                            Aucun client ne correspond à "{searchTerm}"
                        </p>
                        <button onClick={onClear} className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium mx-auto flex items-center gap-2"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                            <FilterX className="w-4 h-4" />
                            Effacer la recherche
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }} />
                <div className="relative flex justify-center -mt-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                        <Building2 className="w-10 h-10" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    </div>
                </div>
                <div className="p-6 pt-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun client</h3>
                    <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Aucun client n'est actuellement enregistré
                    </p>
                    {onAdd && (
                        <button onClick={onAdd} className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 flex items-center gap-2 mx-auto text-sm font-medium"
                            style={{ backgroundColor: COLORS.primary }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau client
                        </button>
                    )}
                </div>
            </div>
        );
    };

const Clients: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [, setRefreshKey] = useState(0);

    const isLoadingRef = useRef(false);
    const initialLoadDone = useRef(false);

    const loadStats = useCallback(async () => {
        try {
            const allClients = await clientService.getAllClients();
            const active = allClients.filter(c => c.active).length;
            setStats({
                total: allClients.length,
                active: active,
                inactive: allClients.length - active
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }, []);

    const loadClients = useCallback(async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setLoading(true);

        try {
            let response;
            if (searchTerm && searchTerm.trim()) {
                response = await clientService.searchClients(searchTerm.trim(), page, 12);
            } else {
                response = await clientService.getClientsPaged(page, 12);
            }
            setClients(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (error) {
            console.error('Error loading clients:', error);
            setClients([]);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadClients();
            loadStats();
        }
    }, [loadClients, loadStats]);

    useEffect(() => {
        if (initialLoadDone.current) {
            loadClients();
        }
    }, [page, searchTerm, loadClients]);

    const handleRefresh = () => {
        setPage(0);
        setRefreshKey(prev => prev + 1);
        loadClients();
        loadStats();
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(0);
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setShowForm(true);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setShowForm(true);
    };

    const handleView = (client: Client) => {
        setSelectedClient(client);
        setShowDetail(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            try {
                await clientService.deleteClient(id);
                handleRefresh();
            } catch (error) {
                console.error('Error deleting client:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await clientService.deactivateClient(id);
            } else {
                await clientService.activateClient(id);
            }
            handleRefresh();
        } catch (error) {
            console.error('Error toggling client status:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    if (loading && clients.length === 0) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
                <Header
                    toggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    currentPage="clients"
                    onAdd={handleAddClient}
                    onSearch={handleSearch}
                    showAddButton={true}
                    showSearch={true}
                    totalCount={0}
                />
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
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
                currentPage="clients"
                onAdd={handleAddClient}
                onSearch={handleSearch}
                showAddButton={true}
                showSearch={true}
                searchValue={searchTerm}
                totalCount={totalElements}
            />

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>Total clients</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}15` }}>
                                <Building2 className="w-5 h-5" style={{ color: COLORS.primary }} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>Clients actifs</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.accent }}>{stats.active}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                <Users className="w-5 h-5" style={{ color: COLORS.accent }} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>Clients inactifs</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{stats.inactive}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}10` }}>
                                <Package className="w-5 h-5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {searchTerm && !loading && clients.length > 0 && (
                    <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        {totalElements} résultat{totalElements > 1 ? 's' : ''} pour "{searchTerm}"
                    </div>
                )}

                {clients.length === 0 && !loading ? (
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <EmptyState
                                searchTerm={searchTerm}
                                onClear={() => handleSearch('')}
                                onAdd={handleAddClient}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {clients.map((client) => (
                                <ClientCard
                                    key={client.id}
                                    client={client}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-6">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    ◀ Précédent
                                </button>
                                <span className="px-4 py-2 text-sm" style={{ color: COLORS.primary }}>
                                    Page {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    Suivant ▶
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showForm && (
                <ClientForm
                    isOpen={showForm}
                    onClose={() => { setShowForm(false); setSelectedClient(null); }}
                    onSuccess={handleRefresh}
                    editClient={selectedClient || undefined}
                />
            )}

            {showDetail && selectedClient && (
                <ClientDetail
                    isOpen={showDetail}
                    onClose={() => { setShowDetail(false); setSelectedClient(null); }}
                    client={selectedClient}
                />
            )}
        </div>
    );
};

export default Clients;