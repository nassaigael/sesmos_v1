import React, { useState } from 'react';
import { Calendar, User, Wrench, Edit, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { Maintenance } from '../../types/Maintenance.types';

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

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ maintenance, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const statusConfig = STATUS_CONFIG[maintenance.status] || STATUS_CONFIG.PENDING;

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
                    {maintenance.client && (
                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.4 }}>
                            Client: {maintenance.client.companyName}
                        </p>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    {maintenance.description && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <span className="text-xs flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                {maintenance.description.length > 60 ? maintenance.description.substring(0, 60) + '...' : maintenance.description}
                            </span>
                        </div>
                    )}
                    {maintenance.technician && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <User className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                {maintenance.technician.name}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.7 }}>
                            {maintenance.startDate ? new Date(maintenance.startDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                        </span>
                    </div>
                    {maintenance.scheduledDate && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                Demandée le {new Date(maintenance.scheduledDate).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onEdit(maintenance)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(maintenance.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.danger }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                    </button>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300"
                style={{ backgroundColor: COLORS.warning, transform: isHovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }} />
        </div>
    );
};

export default MaintenanceCard;