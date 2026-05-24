import React from 'react';
import { Edit, Trash2, User, Calendar, Wrench, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { Maintenance } from '../../types/Maintenance.types';

interface MaintenanceListProps {
    maintenances: Maintenance[];
    onEdit: (maintenance: Maintenance) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    success: '#10B981',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'En attente',
        color: COLORS.warning,
        bgColor: `${COLORS.warning}15`,
        icon: <Clock className="w-3 h-3" />
    },
    IN_PROGRESS: {
        label: 'En cours',
        color: COLORS.primary,
        bgColor: `${COLORS.primary}10`,
        icon: <Wrench className="w-3 h-3" />
    },
    COMPLETED: {
        label: 'Terminé',
        color: COLORS.success,
        bgColor: `${COLORS.success}15`,
        icon: <CheckCircle className="w-3 h-3" />
    },
    CANCELLED: {
        label: 'Annulé',
        color: COLORS.danger,
        bgColor: `${COLORS.danger}10`,
        icon: <AlertCircle className="w-3 h-3" />
    },
};

const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const MaintenanceList: React.FC<MaintenanceListProps> = ({ maintenances, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b" style={{ backgroundColor: COLORS.borderLight, borderColor: COLORS.border }}>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Équipement</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Technicien</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Statut</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Date début</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenances.map((maintenance) => {
                            const statusConfig = STATUS_CONFIG[maintenance.status] || STATUS_CONFIG.PENDING;
                            return (
                                <tr key={maintenance.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                            <span className="text-sm font-medium" style={{ color: COLORS.primary }}>{maintenance.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {maintenance.equipment?.imageUrl ? (
                                                <img src={maintenance.equipment.imageUrl} alt={maintenance.equipment.name} className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: COLORS.primary }}>
                                                    {maintenance.equipment?.name ? getInitials(maintenance.equipment.name) : 'E'}
                                                </div>
                                            )}
                                            <span className="text-sm" style={{ color: COLORS.primary }}>{maintenance.equipment?.name || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                            <span className="text-sm" style={{ color: COLORS.primary }}>{maintenance.technician?.name || 'Non assigné'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                            <span className="text-sm" style={{ color: COLORS.primary }}>
                                                {maintenance.startDate ? new Date(maintenance.startDate).toLocaleDateString('fr-FR') : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onEdit(maintenance)} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Modifier">
                                                <Edit className="w-4 h-4" style={{ color: COLORS.warning }} />
                                            </button>
                                            <button onClick={() => onDelete(maintenance.id)} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Supprimer">
                                                <Trash2 className="w-4 h-4" style={{ color: COLORS.danger }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaintenanceList;