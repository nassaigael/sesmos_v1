import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import EquipmentCard from '../components/equipment/EquipmentCard';
import EquipmentForm from '../components/equipment/EquipmentForm';
import { Plus, Search, Package } from 'lucide-react';
import equipmentService from '../services/equipmentService';
import type { Equipment, EquipmentStatus } from '../types/Equipment.types';

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
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const STATUS_CONFIG: Record<EquipmentStatus, { label: string }> = {
    ACTIVE: { label: 'Actif' },
    MAINTENANCE: { label: 'Maintenance' },
    DOWN: { label: 'Hors service' }
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
        <div className="relative flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
        </div>
        <div className="p-4 pt-6">
            <div className="text-center mb-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
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

const EmptyState: React.FC<{ onAdd: () => void; searchTerm: string }> = ({ onAdd, searchTerm }) => {
    if (searchTerm) {
        return (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
                <div className="relative flex justify-center -mt-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                        <Search className="w-10 h-10" style={{ color: COLORS.warning, opacity: 0.5 }} />
                    </div>
                </div>
                <div className="p-6 pt-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
                        Aucun résultat trouvé
                    </h3>
                    <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Aucun équipement ne correspond à "{searchTerm}"
                    </p>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('clearSearch'))}
                        className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                    >
                        Effacer la recherche
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
            <div className="relative flex justify-center -mt-12">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                    <Package className="w-10 h-10" style={{ color: COLORS.primary, opacity: 0.3 }} />
                </div>
            </div>
            <div className="p-6 pt-6 text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
                    Aucun équipement
                </h3>
                <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    Aucun équipement n'est actuellement enregistré
                </p>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 flex items-center gap-2 mx-auto text-sm font-medium"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un équipement
                </button>
            </div>
        </div>
    );
};

const Equipment: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'ALL'>('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleClearSearch = () => setSearchTerm('');
        window.addEventListener('clearSearch', handleClearSearch);
        return () => window.removeEventListener('clearSearch', handleClearSearch);
    }, []);

    const loadEquipments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await equipmentService.getAll();
            setEquipments(data);
        } catch (error) {
            console.error('Error loading equipments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEquipments();
    }, [loadEquipments, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleAdd = () => {
        setEditEquipment(null);
        setShowForm(true);
    };

    const handleEdit = (equipment: Equipment) => {
        setEditEquipment(equipment);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
            try {
                await equipmentService.delete(id);
                handleRefresh();
            } catch (error) {
                console.error('Error deleting equipment:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditEquipment(null);
        handleRefresh();
    };

    const filteredEquipments = equipments.filter(eq => {
        const matchSearch = searchTerm === '' ||
            eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || eq.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = {
        ALL: equipments.length,
        ACTIVE: equipments.filter(e => e.status === 'ACTIVE').length,
        MAINTENANCE: equipments.filter(e => e.status === 'MAINTENANCE').length,
        DOWN: equipments.filter(e => e.status === 'DOWN').length
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="equipment"
                onAdd={handleAdd}
                onSearch={setSearchTerm}
                showAddButton={true}
                showSearch={true}
                totalCount={filteredEquipments.length}
            />

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {(['ALL', 'ACTIVE', 'MAINTENANCE', 'DOWN'] as const).map(s => {
                        const statusConfig = s !== 'ALL' ? STATUS_CONFIG[s as EquipmentStatus] : null;
                        return (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className="bg-white rounded-2xl p-4 shadow-sm border text-left transition-all hover:shadow-md"
                                style={{
                                    borderColor: filterStatus === s ? (s === 'ALL' ? COLORS.primary : COLORS.warning) : COLORS.border,
                                    borderWidth: filterStatus === s ? 2 : 1
                                }}
                            >
                                <p className="text-2xl font-bold" style={{ color: s === 'ALL' ? COLORS.primary : COLORS.warning }}>
                                    {counts[s]}
                                </p>
                                <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                    {s === 'ALL' ? 'Total' : statusConfig?.label}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {searchTerm && !loading && filteredEquipments.length > 0 && (
                    <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        {filteredEquipments.length} résultat{filteredEquipments.length > 1 ? 's' : ''} pour "{searchTerm}"
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredEquipments.length === 0 ? (
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <EmptyState onAdd={handleAdd} searchTerm={searchTerm} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEquipments.map((equipment) => (
                            <EquipmentCard
                                key={equipment.id}
                                equipment={equipment}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <EquipmentForm
                    isOpen={showForm}
                    onClose={handleCloseForm}
                    onSuccess={handleCloseForm}
                    editEquipment={editEquipment || undefined}
                />
            )}
        </div>
    );
};

export default Equipment;