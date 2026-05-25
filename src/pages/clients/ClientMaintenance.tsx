import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import ClientMaintenanceCard from '../../components/client/ClientMaintenanceCard';
import ClientMaintenanceDetail from '../../components/maintenance/MaintenanceDetail';
import { Plus, Search, Wrench } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import type { Maintenance } from '../../types/Maintenance.types';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
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
            </div>
        </div>
    </div>
);

const ClientMaintenance: React.FC = () => {
    const navigate = useNavigate();
    const { clientData, loading: clientLoading } = useClientAuth();
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('all');
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        if (clientData?.id) {
            loadMaintenances();
        }
    }, [clientData]);

    const loadMaintenances = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/maintenances/client/${clientData?.id}`);
            setMaintenances(response.data || []);
        } catch (error) {
            console.error('Error loading maintenances:', error);
            setMaintenances([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setShowDetail(true);
    };

    const handleNewRequest = () => {
        navigate('/client/equipment');
    };

    const filteredMaintenances = maintenances.filter(m => {
        if (searchTerm && !m.type?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !m.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        if (filter !== 'all' && m.status !== filter) {
            return false;
        }
        return true;
    });

    const counts = {
        all: maintenances.length,
        PENDING: maintenances.filter(m => m.status === 'PENDING').length,
        IN_PROGRESS: maintenances.filter(m => m.status === 'IN_PROGRESS').length,
        COMPLETED: maintenances.filter(m => m.status === 'COMPLETED').length,
        CANCELLED: maintenances.filter(m => m.status === 'CANCELLED').length,
    };

    if (clientLoading || loading) {
        return (
            <div>
                <div className="mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <button
                    onClick={handleNewRequest}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle demande
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'all' ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                    style={filter === 'all' ? { backgroundColor: COLORS.primary } : { color: COLORS.primary }}
                >
                    Toutes ({counts.all})
                </button>
                <button
                    onClick={() => setFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'PENDING' ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                    style={filter === 'PENDING' ? { backgroundColor: COLORS.accent, color: COLORS.primary } : { color: COLORS.accent }}
                >
                    En attente ({counts.PENDING})
                </button>
                <button
                    onClick={() => setFilter('IN_PROGRESS')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'IN_PROGRESS' ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                    style={filter === 'IN_PROGRESS' ? { backgroundColor: '#3B82F6' } : { color: '#3B82F6' }}
                >
                    En cours ({counts.IN_PROGRESS})
                </button>
                <button
                    onClick={() => setFilter('COMPLETED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'COMPLETED' ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                    style={filter === 'COMPLETED' ? { backgroundColor: '#10B981' } : { color: '#10B981' }}
                >
                    Terminé ({counts.COMPLETED})
                </button>
                <button
                    onClick={() => setFilter('CANCELLED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'CANCELLED' ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                    style={filter === 'CANCELLED' ? { backgroundColor: '#EF4444' } : { color: '#EF4444' }}
                >
                    Annulé ({counts.CANCELLED})
                </button>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder="Rechercher par type ou équipement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: COLORS.border }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                </div>
            </div>

            {searchTerm && filteredMaintenances.length > 0 && (
                <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    {filteredMaintenances.length} résultat{filteredMaintenances.length > 1 ? 's' : ''} pour "{searchTerm}"
                </div>
            )}

            {filteredMaintenances.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
                        {searchTerm ? (
                            <Search className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        ) : filter !== 'all' ? (
                            <Wrench className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        ) : (
                            <Wrench className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary }}>
                        {searchTerm ? 'Aucun résultat trouvé' : filter !== 'all' ? 'Aucune maintenance avec ce statut' : 'Aucune maintenance'}
                    </h3>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {searchTerm
                            ? `Aucune maintenance ne correspond à "${searchTerm}"`
                            : filter !== 'all'
                                ? 'Vous n\'avez aucune maintenance avec ce statut'
                                : 'Vous n\'avez pas encore de demande de maintenance'}
                    </p>
                    {(searchTerm || filter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilter('all');
                            }}
                            className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                        >
                            Réinitialiser les filtres
                        </button>
                    )}
                    {!searchTerm && filter === 'all' && (
                        <button
                            onClick={handleNewRequest}
                            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                        >
                            + Nouvelle demande
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMaintenances.map((maintenance) => (
                        <ClientMaintenanceCard
                            key={maintenance.id}
                            maintenance={maintenance}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}

            {showDetail && selectedMaintenance && (
                <ClientMaintenanceDetail
                    isOpen={showDetail}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedMaintenance(null);
                    }}
                    maintenance={selectedMaintenance}
                />
            )}
        </div>
    );
};

export default ClientMaintenance;