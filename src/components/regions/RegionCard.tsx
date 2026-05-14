import React from 'react';
import { MapPin, Globe, Edit, Trash2 } from 'lucide-react';
import type { Region } from '../../types/region.types';

interface RegionCardProps {
    region: Region;
    onEdit: (region: Region) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)'
};

const RegionCard: React.FC<RegionCardProps> = ({ region, onEdit, onDelete }) => {
    return (
        <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white border-4 border-white shadow-lg">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}10` }}>
                        <MapPin className="w-8 h-8" style={{ color: COLORS.primary, opacity: 0.5 }} />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6 text-center">
                <h3 className="font-bold text-lg mb-1" style={{ color: COLORS.primary }}>
                    {region.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-3">
                    <Globe className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>{region.country}</span>
                </div>

                {region.latitude && region.longitude ? (
                    <div className="mb-4 p-2 rounded-lg" style={{ backgroundColor: `${COLORS.primary}05` }}>
                        <p className="text-xs font-mono" style={{ color: COLORS.primary, opacity: 0.5 }}>
                         {region.latitude.toFixed(4)}°, {region.longitude.toFixed(4)}°
                        </p>
                    </div>
                ) : (
                    <div className="mb-4 p-2 rounded-lg" style={{ backgroundColor: `${COLORS.primary}05` }}>
                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.4 }}>Coordonnées non définies</p>
                    </div>
                )}

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onEdit(region)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.border, color: COLORS.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 60, 94, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.border}
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(region.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: COLORS.border, color: COLORS.danger }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.border}
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>

        </div>
    );
};

export default RegionCard;