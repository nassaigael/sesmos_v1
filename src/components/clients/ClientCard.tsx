import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import type { Client } from '../../types/client.types';

interface ClientCardProps {
    client: Client;
    onView: (client: Client) => void;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    white: '#FFFFFF'
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const ClientCard: React.FC<ClientCardProps> = ({ client, onView, onEdit, onDelete, onToggleStatus }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.action-button')) return;
        onView(client);
    };

    const handleStatusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleStatus(client.id, client.active);
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
                    <button
                        onClick={handleStatusClick}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all hover:scale-105 action-button`}
                        style={{
                            backgroundColor: client.active ? `${COLORS.accent}20` : 'rgba(0,0,0,0.4)',
                            color: client.active ? COLORS.accent : COLORS.white,
                            cursor: 'pointer'
                        }}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${client.active ? 'animate-pulse' : ''}`} style={{ backgroundColor: client.active ? COLORS.accent : COLORS.white }} />
                        {client.active ? 'Actif' : 'Inactif'}
                    </button>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {client.logoUrl && !imageError ? (
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                            <img
                                src={client.logoUrl}
                                alt={client.companyName}
                                className="w-full h-full object-cover object-center"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}>
                            {getInitials(client.companyName)}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.accent }}>
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {client.companyName}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {client.contactName}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <Mail className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <span className="text-xs truncate flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <Phone className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.7 }}>{client.phone}</span>
                    </div>
                    {client.address && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span className="text-xs truncate flex-1" style={{ color: COLORS.primary, opacity: 0.7 }}>{client.address}</span>
                        </div>
                    )}
                </div>

                {client.totalRevenue !== undefined && client.totalRevenue !== null && (
                    <div className="mb-3 p-2 rounded-lg text-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
                        <p className="text-xs" style={{ color: COLORS.accent, opacity: 0.7 }}>Chiffre d'affaires</p>
                        <p className="text-sm font-bold" style={{ color: COLORS.accent }}>
                            {(client.totalRevenue ? client.totalRevenue.toLocaleString() : '0')} Ar
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(client); }}
                        className="flex-1 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                    >
                        Détails
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                        className="flex-1 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.accent }}
                    >
                        Modifier
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                        className="flex-1 px-2 py-1.5 rounded-lg transition-all text-xs font-medium action-button"
                        style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary, opacity: 0.6 }}
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientCard;