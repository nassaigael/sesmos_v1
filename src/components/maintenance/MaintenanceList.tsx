import React from 'react';
import { Edit, Trash2, Wrench, Calendar, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import type { Maintenance, MaintenanceStatus } from '../../types/Maintenance.types';

interface MaintenanceListProps {
    maintenances: Maintenance[];
    onEdit: (maintenance: Maintenance) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    PLANIFIE: {
        label: 'Planifié',
        color: COLORS.primary,
        bgColor: `${COLORS.primary}10`,
        icon: <Calendar className="w-3.5 h-3.5" />
    },
    EN_COURS: {
        label: 'En cours',
        color: COLORS.warning,
        bgColor: `${COLORS.warning}15`,
        icon: <Clock className="w-3.5 h-3.5" />
    },
    TERMINE: {
        label: 'Terminé',
        color: COLORS.primary,
        bgColor: `${COLORS.primary}10`,
        icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    ANNULE: {
        label: 'Annulé',
        color: COLORS.danger,
        bgColor: `${COLORS.danger}10`,
        icon: <XCircle className="w-3.5 h-3.5" />
    },
};

const getTechnicianName = (tech: any): string => {
    if (!tech) return '—';
    if (tech.name) return tech.name;
    if (tech.firstName && tech.lastName) return `${tech.firstName} ${tech.lastName}`;
    return '—';
};

const MaintenanceList: React.FC<MaintenanceListProps> = ({ maintenances, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: COLORS.borderLight }}>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Équipement</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Technicien</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Début</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Fin</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Statut</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenances.map((m) => {
                            const sc = STATUS_CONFIG[m.status];
                            const equipmentImage = (m.equipment as any)?.imageUrl;

                            return (
                                <tr key={m.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: sc.bgColor, color: sc.color }}>
                                                <Wrench className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-medium text-sm" style={{ color: COLORS.primary }}>{m.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {equipmentImage ? (
                                                <img
                                                    src={equipmentImage}
                                                    alt={m.equipment?.name}
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                                    <Package className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.8 }}>
                                                    {m.equipment?.name || '—'}
                                                </span>
                                                {m.equipment?.serialNumber && (
                                                    <div className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                        {m.equipment.serialNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                        {getTechnicianName(m.technician)}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        {m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                        {m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sc.bgColor, color: sc.color }}>
                                            {sc.icon}
                                            <span>{sc.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => onEdit(m)}
                                                className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                                                style={{ color: COLORS.primary }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(m.id)}
                                                className="p-1.5 rounded-lg transition-all hover:bg-red-50"
                                                style={{ color: COLORS.danger }}
                                            >
                                                <Trash2 className="w-4 h-4" />
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