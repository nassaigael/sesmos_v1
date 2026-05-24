import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import ClientEquipmentCard from '../../components/client/ClientEquipmentCard';
import { Package, Search, FilterX } from 'lucide-react';
import api from '../../api/axiosConfig';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
        <div className="h-28" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
        <div className="relative flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
        </div>
        <div className="p-5 pt-4">
            <div className="text-center mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
            <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </div>
                </div>
            </div>
            <div className="pt-3 border-t">
                <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC<{ message?: string; onRetry?: () => void; icon?: React.ReactNode }> = ({ message, onRetry, icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
            {icon || <Package className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />}
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary }}>
            {message || 'Aucun équipement'}
        </h3>
        <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
            {message ? 'Une erreur est survenue lors du chargement' : 'Aucun équipement n\'est actuellement enregistré'}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
            >
                Réessayer
            </button>
        )}
    </div>
);

const ClientEquipment: React.FC = () => {
    const { clientData, loading: clientLoading } = useClientAuth();
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

    useEffect(() => {
        if (clientData?.id) {
            loadEquipments();
        } else if (!clientLoading) {
            setLoading(false);
        }
    }, [clientData]);

    const loadEquipments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/equipment/client/${clientData?.id}`);
            setEquipments(response.data || []);
        } catch (error) {
            console.error('Error loading equipments:', error);
            setError('Impossible de charger vos équipements');
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEquipments = equipments.filter(eq => {
        if (searchTerm && !eq.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filter === 'active' && eq.status !== 'ACTIVE') return false;
        if (filter === 'maintenance' && eq.status !== 'MAINTENANCE') return false;
        if (filter === 'inactive' && eq.status !== 'INACTIVE') return false;
        return true;
    });

    const stats = {
        total: equipments.length,
        active: equipments.filter(e => e.status === 'ACTIVE').length,
        maintenance: equipments.filter(e => e.status === 'MAINTENANCE').length,
        inactive: equipments.filter(e => e.status === 'INACTIVE').length
    };

    const hasActiveFilters = filter !== 'all' || searchTerm !== '';

    if (clientLoading || loading) {
        return (
            <div>
                <div className="mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm p-3 text-center border animate-pulse" style={{ borderColor: COLORS.border }}>
                            <div className="h-7 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Mes équipements</h1>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Suivez votre parc matériel</p>
                </div>
                <EmptyState message={error} onRetry={loadEquipments} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Mes équipements</h1>
                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Suivez votre parc matériel</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div
                    className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all hover:scale-105"
                    style={{ borderColor: filter === 'all' ? COLORS.accent : COLORS.border }}
                    onClick={() => setFilter('all')}
                >
                    <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{stats.total}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Total</p>
                </div>
                <div
                    className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all hover:scale-105"
                    style={{ borderColor: filter === 'active' ? COLORS.accent : COLORS.border }}
                    onClick={() => setFilter('active')}
                >
                    <p className="text-xl font-bold" style={{ color: COLORS.accent }}>{stats.active}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Actif</p>
                </div>
                <div
                    className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all hover:scale-105"
                    style={{ borderColor: filter === 'maintenance' ? COLORS.accent : COLORS.border }}
                    onClick={() => setFilter('maintenance')}
                >
                    <p className="text-xl font-bold" style={{ color: COLORS.accent }}>{stats.maintenance}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Maintenance</p>
                </div>
                <div
                    className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all hover:scale-105"
                    style={{ borderColor: filter === 'inactive' ? COLORS.accent : COLORS.border }}
                    onClick={() => setFilter('inactive')}
                >
                    <p className="text-xl font-bold" style={{ color: COLORS.primary, opacity: 0.6 }}>{stats.inactive}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Hors service</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder="Rechercher un équipement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: COLORS.border }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                </div>
            </div>

            {filteredEquipments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
                        {hasActiveFilters ? (
                            <FilterX className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        ) : searchTerm ? (
                            <Search className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        ) : (
                            <Package className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary }}>
                        {hasActiveFilters ? 'Aucun résultat avec ces filtres' : searchTerm ? 'Aucun résultat trouvé' : 'Aucun équipement'}
                    </h3>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {hasActiveFilters
                            ? 'Aucun équipement ne correspond aux filtres sélectionnés'
                            : searchTerm
                                ? `Aucun équipement ne correspond à "${searchTerm}"`
                                : 'Aucun équipement n\'est actuellement enregistré'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setFilter('all');
                                setSearchTerm('');
                            }}
                            className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50 flex items-center gap-2 mx-auto"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                        >
                            <FilterX className="w-4 h-4" />
                            Réinitialiser les filtres
                        </button>
                    )}
                    {searchTerm && !hasActiveFilters && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                        >
                            Effacer la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredEquipments.map((equipment) => (
                        <ClientEquipmentCard
                            key={equipment.id}
                            equipment={equipment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientEquipment;