import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Package, Wrench, ShoppingBag, Clock, TrendingUp, Activity, Building2, Mail, Phone, MapPin } from 'lucide-react';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientDashboard: React.FC = () => {
    const { clientData, loading } = useClientAuth();
    const [stats, setStats] = useState({
        equipments: 0,
        maintenances: 0,
        sales: 0,
        pendingMaintenances: 0
    });

    useEffect(() => {
        if (clientData) {
            setStats({
                equipments: clientData.activeEquipments || 0,
                maintenances: 0,
                sales: clientData.totalSales || 0,
                pendingMaintenances: 0
            });
        }
    }, [clientData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Tableau de bord</h1>
                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    Bienvenue {clientData?.contactName}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Équipements</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.equipments}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Package className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Maintenances</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.maintenances}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Wrench className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Ventes</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.sales}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>En attente</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.pendingMaintenances}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Clock className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-5" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <Activity className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Informations client
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Entreprise</span>
                            <span className="font-medium" style={{ color: COLORS.primary }}>{clientData?.companyName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Contact</span>
                            <span className="font-medium" style={{ color: COLORS.primary }}>{clientData?.contactName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Email</span>
                            <span className="font-medium" style={{ color: COLORS.primary }}>{clientData?.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Téléphone</span>
                            <span className="font-medium" style={{ color: COLORS.primary }}>{clientData?.phone}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <TrendingUp className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Chiffre d'affaires
                    </h3>
                    <div className="text-center py-8">
                        <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                            {(clientData?.totalRevenue ? clientData.totalRevenue.toLocaleString() : '0')} Ar
                        </p>
                        <p className="text-sm mt-2" style={{ color: COLORS.primary, opacity: 0.6 }}>Total des ventes</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;