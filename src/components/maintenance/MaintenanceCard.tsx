import React, { useState } from 'react';
import { Edit, Trash2, Wrench, Calendar, Clock, CheckCircle, XCircle, User, Package } from 'lucide-react';
import type { Maintenance, MaintenanceStatus } from '../../types/Maintenance.types';

interface MaintenanceCardProps {
    maintenance: Maintenance;
    onEdit: (maintenance: Maintenance) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    warning: '#FFC107',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    white: '#FFFFFF'
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
    if (!tech) return 'Non assigné';
    if (tech.name) return tech.name;
    if (tech.firstName && tech.lastName) return `${tech.firstName} ${tech.lastName}`;
    return '—';
};

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ maintenance, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const statusConfig = STATUS_CONFIG[maintenance.status];

    const equipmentName = maintenance.equipment?.name || 'Équipement';
    const equipmentImage = (maintenance.equipment as any)?.imageUrl;

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
                <div className="absolute top-3 right-3 z-10">
                    <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                    >
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                    </div>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {equipmentImage && !imageError ? (
                        <img
                            src={equipmentImage}
                            alt={equipmentName}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                            style={{ backgroundColor: statusConfig.color }}
                        >
                            <Package className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.warning }}
                    >
                        <Wrench className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-base" style={{ color: COLORS.primary }}>
                        {maintenance.type}
                    </h3>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        {equipmentName}
                    </p>
                    {maintenance.equipment?.serialNumber && (
                        <p className="text-xs mt-0.5 font-mono" style={{ color: COLORS.primary, opacity: 0.4 }}>
                            S/N: {maintenance.equipment.serialNumber}
                        </p>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Technicien</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {getTechnicianName(maintenance.technician)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Dates</span>
                        </div>
                        <span className="text-xs" style={{ color: COLORS.primary }}>
                            {formatDate(maintenance.startDate)} → {formatDate(maintenance.endDate)}
                        </span>
                    </div>
                </div>

                {maintenance.description && (
                    <div className="mb-3 p-2 rounded-lg text-xs" style={{ backgroundColor: COLORS.borderLight }}>
                        <p className="line-clamp-2" style={{ color: COLORS.primary, opacity: 0.7 }}>
                            {maintenance.description}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onEdit(maintenance)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 60, 94, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(maintenance.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.danger }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>

            <div
                className="absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300"
                style={{
                    backgroundColor: statusConfig.color,
                    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left'
                }}
            />
        </div>
    );
};

export default MaintenanceCard;