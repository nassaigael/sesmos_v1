import React, { useState } from 'react';
import { Package, Wifi, Calendar, Building2 } from 'lucide-react';

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
    };
    onRequestMaintenance: (id: string, name: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'Actif';
        case 'MAINTENANCE': return 'En maintenance';
        default: return 'Hors service';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return COLORS.accent;
        case 'MAINTENANCE': return COLORS.accent;
        default: return COLORS.primary;
    }
};

const ClientEquipmentCard: React.FC<ClientEquipmentCardProps> = ({ equipment, onRequestMaintenance }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                <div className="absolute top-3 right-3 z-10">
                    <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{
                            backgroundColor: `${getStatusColor(equipment.status)}20`,
                            color: getStatusColor(equipment.status),
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor(equipment.status) }} />
                        {getStatusLabel(equipment.status)}
                    </div>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {equipment.imageUrl && !imageError ? (
                        <img
                            src={equipment.imageUrl}
                            alt={equipment.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            {equipment.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.accent }}
                    >
                        <Wifi className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {equipment.name}
                    </h3>
                    <p className="text-xs font-mono mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        SN: {equipment.serialNumber}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
                    {equipment.product && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Package className="w-3.5 h-3.5" style={{ color: COLORS.accent, opacity: 0.7 }} />
                            <span className="text-xs flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                {equipment.product.name}
                            </span>
                        </div>
                    )}
                    {equipment.region && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Building2 className="w-3.5 h-3.5" style={{ color: COLORS.accent, opacity: 0.7 }} />
                            <span className="text-xs flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                {equipment.region.name}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: COLORS.accent, opacity: 0.7 }} />
                        <span className="text-xs flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
                            Installé le {equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onRequestMaintenance(equipment.id, equipment.name)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.accent }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${COLORS.accent}20`}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                    >
                        Demander maintenance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientEquipmentCard;