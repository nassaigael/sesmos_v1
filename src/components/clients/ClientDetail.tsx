import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, FileText, CreditCard, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Client } from '../../types/client.types';
import clientService from '../../services/clientService';

interface ClientDetailProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onEdit?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientDetail: React.FC<ClientDetailProps> = ({ isOpen, onClose, client, onEdit }) => {
    const [imageError, setImageError] = useState(false);
    const [refreshData, setRefreshData] = useState(client);

    useEffect(() => {
        const loadFreshData = async () => {
            try {
                const freshClient = await clientService.getClientById(client.id);
                setRefreshData(freshClient);
            } catch (error) {
                console.error('Error refreshing client data:', error);
            }
        };
        if (isOpen && client.id) {
            loadFreshData();
        }
    }, [isOpen, client.id]);

    if (!isOpen) return null;

    const data = refreshData;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.4)' }} onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-6 pt-6 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <Building2 className="w-5 h-5" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-xl">Détail du client</h2>
                                        <p className="text-white/60 text-sm">Informations complètes et statistiques</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={onEdit}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                                        >
                                            <Edit className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                                    >
                                        <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="relative">
                                {data.logoUrl && !imageError ? (
                                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                        <img
                                            src={data.logoUrl}
                                            alt={data.companyName}
                                            className="w-full h-full object-cover object-center"
                                            onError={() => setImageError(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl" style={{ backgroundColor: COLORS.primary }}>
                                        {data.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-3 border-white shadow-md" style={{ backgroundColor: COLORS.accent }}>
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{data.companyName}</h3>
                                        <p className="text-sm mt-1 flex items-center justify-center md:justify-start gap-2" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                            <User className="w-3.5 h-3.5" />
                                            {data.contactName}
                                        </p>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium self-center md:self-auto ${data.active ? 'animate-pulse' : ''}`} style={{ backgroundColor: data.active ? `${COLORS.accent}15` : 'rgba(0,0,0,0.05)', color: data.active ? COLORS.accent : COLORS.primary, opacity: data.active ? 1 : 0.6 }}>
                                        {data.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        {data.active ? 'Client actif' : 'Client inactif'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Coordonnées
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Mail className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Email</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Phone className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Téléphone</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Informations générales
                                </h4>
                                <div className="space-y-3">
                                    {data.address && (
                                        <div className="flex items-start gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <MapPin className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Adresse</p>
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Clock className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Membre depuis</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                                {new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(data.taxId || data.vatNumber) && (
                            <div className="mb-8 p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${COLORS.borderLight} 0%, transparent 100%)` }}>
                                <div className="flex flex-wrap gap-4">
                                    {data.taxId && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <FileText className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                            </div>
                                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>NIF:</span>
                                            <span className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{data.taxId}</span>
                                        </div>
                                    )}
                                    {data.vatNumber && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <CreditCard className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                            </div>
                                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>N° TVA:</span>
                                            <span className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{data.vatNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6" style={{ borderColor: COLORS.border }}>
                            <h4 className="font-semibold mb-4" style={{ color: COLORS.primary }}>
                                Statistiques
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {(data.totalRevenue ? data.totalRevenue.toLocaleString() : '0')} Ar
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Chiffre d'affaires</p>
                                </div>
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {data.totalSales || 0}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Ventes</p>
                                </div>
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {data.activeEquipments || 0}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Équipements actifs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;