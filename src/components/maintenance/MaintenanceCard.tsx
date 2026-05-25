import React, { useState } from 'react';
import { Calendar, Wrench, Clock, AlertCircle, CheckCircle, Building2, FileText } from 'lucide-react';
import type { Maintenance } from '../../types/Maintenance.types';

interface MaintenanceCardProps {
    maintenance: Maintenance;
    onEdit: (maintenance: Maintenance) => void;
    onDelete: (id: string) => void;
    onViewDetails: (maintenance: Maintenance) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
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

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ maintenance, onEdit, onDelete, onViewDetails }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const statusConfig = STATUS_CONFIG[maintenance.status] || STATUS_CONFIG.PENDING;

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.action-button')) {
            return;
        }
        onViewDetails(maintenance);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
                <div className="absolute top-3 right-3 z-10">
                    <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                    </div>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {maintenance.equipment?.imageUrl && !imageError ? (
                        <img
                            src={maintenance.equipment.imageUrl}
                            alt={maintenance.equipment.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            {maintenance.equipment?.name ? getInitials(maintenance.equipment.name) : 'M'}
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
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {maintenance.type || 'Maintenance'}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {maintenance.equipment?.name || 'Équipement inconnu'}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
                    {maintenance.client && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Building2 className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>Demandé par</p>
                                <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                    {maintenance.client.companyName}
                                </p>
                            </div>
                        </div>
                    )}

                    {maintenance.description && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Description</p>
                                <div
                                    className="text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                                    style={{ color: COLORS.primary, opacity: 0.7 }}
                                    title={maintenance.description}
                                >
                                    {maintenance.description}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>Date création</p>
                            <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                {maintenance.createdAt ? new Date(maintenance.createdAt).toLocaleDateString('fr-FR') : 'Non définie'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t action-buttons" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(maintenance); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.warning }}
                    >
                        Détails
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(maintenance); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                    >
                        Modifier
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(maintenance.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.danger }}
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceCard;