import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Wifi, Power, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientEquipment: React.FC = () => {
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

    useEffect(() => {
        setTimeout(() => {
            setEquipments([]);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'MAINTENANCE': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Power className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Actif';
            case 'MAINTENANCE': return 'En maintenance';
            default: return 'Hors service';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
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
                <div className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all" style={{ borderColor: filter === 'all' ? COLORS.accent : COLORS.border }} onClick={() => setFilter('all')}>
                    <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{stats.total}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Total</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all" style={{ borderColor: filter === 'active' ? COLORS.accent : COLORS.border }} onClick={() => setFilter('active')}>
                    <p className="text-xl font-bold" style={{ color: '#10B981' }}>{stats.active}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Actif</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all" style={{ borderColor: filter === 'maintenance' ? COLORS.accent : COLORS.border }} onClick={() => setFilter('maintenance')}>
                    <p className="text-xl font-bold" style={{ color: '#F59E0B' }}>{stats.maintenance}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Maintenance</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 text-center border cursor-pointer hover:shadow-md transition-all" style={{ borderColor: filter === 'inactive' ? COLORS.accent : COLORS.border }} onClick={() => setFilter('inactive')}>
                    <p className="text-xl font-bold" style={{ color: '#EF4444' }}>{stats.inactive}</p>
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Hors service</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input type="text" placeholder="Rechercher un équipement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" style={{ borderColor: COLORS.border }} />
                </div>
                <button className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            {filteredEquipments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>Aucun équipement</h3>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucun équipement n'est actuellement enregistré</p>
                    <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>
                        + AJOUTER UN ÉQUIPEMENT
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEquipments.map((equipment) => (
                        <div key={equipment.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                        <Wifi className="w-5 h-5" style={{ color: COLORS.accent }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: COLORS.primary }}>{equipment.name}</h3>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{equipment.serialNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(equipment.status)}
                                    <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>{getStatusLabel(equipment.status)}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Installé le {new Date().toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientEquipment;