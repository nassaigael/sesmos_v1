import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Clock, AlertCircle, CheckCircle, Plus, Search } from 'lucide-react';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientMaintenance: React.FC = () => {
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setMaintenances([]);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'En attente', color: COLORS.accent, bg: `${COLORS.accent}15` };
            case 'IN_PROGRESS':
                return { label: 'En cours', color: '#3B82F6', bg: '#3B82F615' };
            case 'COMPLETED':
                return { label: 'Terminé', color: '#10B981', bg: '#10B98115' };
            default:
                return { label: 'Annulé', color: '#EF4444', bg: '#EF444415' };
        }
    };

    const filteredMaintenances = maintenances.filter(m =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Maintenances</h1>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Suivez vos demandes de maintenance</p>
                </div>
                <button className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>
                    <Plus className="w-4 h-4" />
                    Nouvelle demande
                </button>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input type="text" placeholder="Rechercher une maintenance..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" style={{ borderColor: COLORS.border }} />
                </div>
            </div>

            {filteredMaintenances.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
                    <Wrench className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>Aucune maintenance</h3>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Vous n'avez pas encore de demande de maintenance</p>
                    <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>
                        + Nouvelle demande
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMaintenances.map((maintenance) => {
                        const status = getStatusBadge(maintenance.status);
                        return (
                            <div key={maintenance.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow" style={{ borderColor: COLORS.border }}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                            <Wrench className="w-5 h-5" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold" style={{ color: COLORS.primary }}>{maintenance.title}</h3>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{maintenance.equipmentName}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                                        {status.label}
                                    </span>
                                </div>
                                <div className="mt-3 pt-3 border-t flex flex-wrap gap-4" style={{ borderColor: COLORS.border }}>
                                    <div className="flex items-center gap-1 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        <Calendar className="w-3 h-3" />
                                        {new Date().toLocaleDateString('fr-FR')}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        <Clock className="w-3 h-3" />
                                        Non planifié
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClientMaintenance;