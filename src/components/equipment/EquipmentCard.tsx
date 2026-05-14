import React, { useState } from 'react';
import { Edit, Trash2, Settings, MapPin, Package } from 'lucide-react';
import type { Equipment } from '../../types/Equipment.types';

interface EquipmentCardProps {
    equipment: Equipment;
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
    ACTIVE: { label: 'ACTIF', bgColor: 'rgba(255, 193, 7, 0.12)', textColor: COLORS.warning },
    MAINTENANCE: { label: 'MAINTENANCE', bgColor: 'rgba(255, 193, 7, 0.12)', textColor: COLORS.warning },
    DOWN: { label: 'HORS SERVICE', bgColor: 'rgba(255, 193, 7, 0.12)', textColor: COLORS.warning }
};

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const statusConfig = STATUS_CONFIG[equipment.status];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="relative h-24"
                style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}
            >
                <div className="absolute top-3 right-3 z-10">
                    <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.textColor,
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <span className="w-1.5 h-1.5 uppercase rounded-full animate-pulse" style={{ backgroundColor: statusConfig.textColor }} />
                        {statusConfig.label}
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
                            {getInitials(equipment.name)}
                        </div>
                    )}
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.warning }}
                    >
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {equipment.name}
                    </h3>
                    <p className="text-xs font-mono mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {equipment.serialNumber}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Produit</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {equipment.product?.name || '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Région</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {equipment.region?.name || '—'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onEdit(equipment)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.warning }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(equipment.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.borderLight, color: '#DC3545' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentCard;