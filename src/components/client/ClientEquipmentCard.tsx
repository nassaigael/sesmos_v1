import React, { useState } from 'react';
import { Package, Wifi, Calendar, Building2, Wrench } from 'lucide-react';
import ClientMaintenanceRequest from './ClientMaintenanceRequest';

interface ClientEquipmentCardProps {
    equipment: {
        id: string;
        name: string;
        serialNumber: string;
        status: string;
        imageUrl: string | null;
        createdAt: string;
        product?: { id: string; name: string };
        region?: { id: string; name: string };
        client?: { id: string };
    };
    onRequestMaintenance?: (id: string, name: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    gray: '#6B7280'
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return { label: 'Actif', color: COLORS.accent };
        case 'MAINTENANCE':
            return { label: 'Maintenance', color: COLORS.accent };
        default:
            return { label: 'Hors service', color: COLORS.gray };
    }
};

const ClientEquipmentCard: React.FC<ClientEquipmentCardProps> = ({ equipment }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const statusConfig = getStatusConfig(equipment.status);

    return (
        <>
            <div
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                style={{
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header avec dégradé */}
                <div className="relative h-28" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-3 right-3 z-10">
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm"
                            style={{
                                backgroundColor: `${statusConfig.color}20`,
                                color: statusConfig.color,
                                backdropFilter: 'blur(8px)'
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusConfig.color }} />
                            <span>{statusConfig.label}</span>
                        </div>
                    </div>
                </div>

                {/* Avatar / Image */}
                <div className="relative flex justify-center -mt-12">
                    <div className="relative group/avatar">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                            {equipment.imageUrl && !imageError ? (
                                <img
                                    src={equipment.imageUrl}
                                    alt={equipment.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    {equipment.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-3 border-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: COLORS.accent }}
                        >
                            <Wifi className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-5 pt-4">
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-lg leading-tight" style={{ color: COLORS.primary }}>
                            {equipment.name}
                        </h3>
                        <p className="text-xs font-mono mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                            SN: {equipment.serialNumber}
                        </p>
                    </div>

                    <div className="space-y-2.5 mb-5">
                        {equipment.product && (
                            <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <Package className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Produit</p>
                                    <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                        {equipment.product.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {equipment.region && (
                            <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <Building2 className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Région</p>
                                    <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                        {equipment.region.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                <Calendar className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Installation</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                    {equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date inconnue'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t" style={{ borderColor: COLORS.border }}>
                        <button
                            onClick={() => setShowMaintenanceModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium group/btn"
                            style={{ backgroundColor: `${COLORS.accent}10`, color: COLORS.accent }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.accent;
                                e.currentTarget.style.color = COLORS.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${COLORS.accent}10`;
                                e.currentTarget.style.color = COLORS.accent;
                            }}
                        >
                            <Wrench className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                            Demander une maintenance
                        </button>
                    </div>
                </div>
            </div>

            {showMaintenanceModal && (
                <ClientMaintenanceRequest
                    isOpen={showMaintenanceModal}
                    onClose={() => setShowMaintenanceModal(false)}
                    onSuccess={() => {
                    }}
                    equipmentId={equipment.id}
                    equipmentName={equipment.name}
                    clientId={equipment.client?.id || ''}
                />
            )}
        </>
    );
};

export default ClientEquipmentCard;