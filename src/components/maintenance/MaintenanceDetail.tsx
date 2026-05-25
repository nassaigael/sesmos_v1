import React from 'react';
import { X, Calendar, User, Wrench, Clock, AlertCircle, CheckCircle, Building2, FileText, Hash, Mail, Phone } from 'lucide-react';
import type { Maintenance } from '../../types/Maintenance.types';

interface MaintenanceDetailProps {
    isOpen: boolean;
    onClose: () => void;
    maintenance: Maintenance;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    danger: '#DC3545',
    success: '#10B981',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA',
    white: '#FFFFFF'
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'En attente',
        color: COLORS.accent,
        bgColor: `${COLORS.accent}15`,
        icon: <Clock className="w-4 h-4" />
    },
    IN_PROGRESS: {
        label: 'En cours',
        color: COLORS.primary,
        bgColor: `${COLORS.primary}10`,
        icon: <Wrench className="w-4 h-4" />
    },
    COMPLETED: {
        label: 'Terminé',
        color: COLORS.success,
        bgColor: `${COLORS.success}15`,
        icon: <CheckCircle className="w-4 h-4" />
    },
    CANCELLED: {
        label: 'Annulé',
        color: COLORS.danger,
        bgColor: `${COLORS.danger}10`,
        icon: <AlertCircle className="w-4 h-4" />
    },
};

const MaintenanceDetail: React.FC<MaintenanceDetailProps> = ({ isOpen, onClose, maintenance }) => {
    if (!isOpen) return null;

    const statusConfig = STATUS_CONFIG[maintenance.status] || STATUS_CONFIG.PENDING;

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (date: string | null | undefined) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div
                    className="fixed inset-0 backdrop-blur-md transition-all duration-300"
                    style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }}
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-6 pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <Wrench className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">Détail de la maintenance</h2>
                                        <p className="text-white/60 text-xs">Informations complètes de l'intervention</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: COLORS.border }}>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: COLORS.primary }}>{maintenance.type}</h3>
                                <p className="text-sm mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                    {maintenance.equipment?.name || 'Équipement inconnu'}
                                </p>
                            </div>
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                            >
                                {statusConfig.icon}
                                <span>{statusConfig.label}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Hash className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.6 }} />
                                    <span className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.7 }}>ID</span>
                                </div>
                                <p className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{maintenance.id.substring(0, 8)}...</p>
                            </div>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.6 }} />
                                    <span className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.7 }}>Date création</span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                    {formatDate(maintenance.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                    <Wrench className="w-3 h-3 text-white" />
                                </div>
                                <h3 className="font-semibold" style={{ color: COLORS.primary }}>Équipement concerné</h3>
                            </div>
                            <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex gap-4">
                                    {maintenance.equipment?.imageUrl ? (
                                        <img
                                            src={maintenance.equipment.imageUrl}
                                            alt={maintenance.equipment.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                            <Wrench className="w-8 h-8" style={{ color: COLORS.accent }} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-base" style={{ color: COLORS.primary }}>{maintenance.equipment?.name}</p>
                                        <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                            SN: {maintenance.equipment?.serialNumber || 'Non renseigné'}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                            Statut: {maintenance.equipment?.status || 'Inconnu'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                    <FileText className="w-3 h-3 text-white" />
                                </div>
                                <h3 className="font-semibold" style={{ color: COLORS.primary }}>Description</h3>
                            </div>
                            <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                <p className="text-sm leading-relaxed" style={{ color: COLORS.primary, opacity: 0.8 }}>
                                    {maintenance.description || 'Aucune description fournie'}
                                </p>
                            </div>
                        </div>

                        {maintenance.client && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                        <Building2 className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="font-semibold" style={{ color: COLORS.primary }}>Client demandeur</h3>
                                </div>
                                <div className="rounded-xl p-4" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                    <div className="flex items-center gap-3">
                                        {maintenance.client.logoUrl ? (
                                            <img
                                                src={maintenance.client.logoUrl}
                                                alt={maintenance.client.companyName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                                <Building2 className="w-5 h-5" style={{ color: COLORS.primary }} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold" style={{ color: COLORS.primary }}>{maintenance.client.companyName}</p>
                                            {maintenance.client.contactName && (
                                                <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                    Contact: {maintenance.client.contactName}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1">
                                                {maintenance.client.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{maintenance.client.email}</span>
                                                    </div>
                                                )}
                                                {maintenance.client.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{maintenance.client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {maintenance.technician && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        <h3 className="font-semibold" style={{ color: COLORS.primary }}>Technicien assigné</h3>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                        <p className="font-semibold" style={{ color: COLORS.primary }}>{maintenance.technician.name}</p>
                                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{maintenance.technician.email}</p>
                                    </div>
                                </div>
                            )}

                            {maintenance.scheduledDate && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                            <Clock className="w-3 h-3 text-white" />
                                        </div>
                                        <h3 className="font-semibold" style={{ color: COLORS.primary }}>Date demandée</h3>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                        <p className="font-semibold" style={{ color: COLORS.primary }}>{formatShortDate(maintenance.scheduledDate)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(maintenance.startDate || maintenance.endDate) && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {maintenance.startDate && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                                <Calendar className="w-3 h-3 text-white" />
                                            </div>
                                            <h3 className="font-semibold" style={{ color: COLORS.primary }}>Date début</h3>
                                        </div>
                                        <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                            <p className="font-semibold" style={{ color: COLORS.primary }}>{formatShortDate(maintenance.startDate)}</p>
                                        </div>
                                    </div>
                                )}
                                {maintenance.endDate && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                                <Calendar className="w-3 h-3 text-white" />
                                            </div>
                                            <h3 className="font-semibold" style={{ color: COLORS.primary }}>Date fin</h3>
                                        </div>
                                        <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                            <p className="font-semibold" style={{ color: COLORS.primary }}>{formatShortDate(maintenance.endDate)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t" style={{ borderColor: COLORS.border, backgroundColor: COLORS.borderLight }}>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 rounded-xl transition-all hover:bg-gray-100 text-sm font-medium"
                            style={{ color: COLORS.primary }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceDetail;