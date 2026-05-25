import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Package, Wrench, ShoppingBag, Clock, TrendingUp, Building2, Mail, Phone, MapPin, Calendar, AlertCircle, User } from 'lucide-react';
import api from '../../api/axiosConfig';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 border animate-pulse" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between">
            <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
        </div>
    </div>
);

const ClientDashboard: React.FC = () => {
    const { clientData, loading: clientLoading } = useClientAuth();
    const [loading, setLoading] = useState(true);
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [stats, setStats] = useState({
        equipments: 0,
        maintenances: 0,
        sales: 0,
        pendingMaintenances: 0,
        inProgressMaintenances: 0,
        completedMaintenances: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });

    useEffect(() => {
        if (clientData?.id) {
            loadDashboardData();
        }
    }, [clientData]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [maintenancesRes, recentSalesRes] = await Promise.all([
                api.get(`/maintenances/client/${clientData?.id}`),
                api.get(`/sales/client/${clientData?.id}?page=0&size=5`).catch(() => ({ data: { content: [] } }))
            ]);

            const maintenancesList = maintenancesRes.data || [];
            setMaintenances(maintenancesList);

            let salesList: any[] = [];
            if (recentSalesRes.data && Array.isArray(recentSalesRes.data)) {
                salesList = recentSalesRes.data;
            } else if (recentSalesRes.data && recentSalesRes.data.content) {
                salesList = recentSalesRes.data.content;
            }
            setRecentSales(salesList);

            const pendingCount = maintenancesList.filter((m: any) => m.status === 'PENDING').length;
            const inProgressCount = maintenancesList.filter((m: any) => m.status === 'IN_PROGRESS').length;
            const completedCount = maintenancesList.filter((m: any) => m.status === 'COMPLETED').length;
            const totalRevenue = clientData?.totalRevenue || 0;
            const salesCount = clientData?.totalSales || 0;
            const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

            setStats({
                equipments: clientData?.activeEquipments || 0,
                maintenances: maintenancesList.length,
                sales: salesCount,
                pendingMaintenances: pendingCount,
                inProgressMaintenances: inProgressCount,
                completedMaintenances: completedCount,
                totalRevenue: totalRevenue,
                averageOrderValue: averageOrderValue
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setStats({
                equipments: clientData?.activeEquipments || 0,
                maintenances: 0,
                sales: clientData?.totalSales || 0,
                pendingMaintenances: 0,
                inProgressMaintenances: 0,
                completedMaintenances: 0,
                totalRevenue: clientData?.totalRevenue || 0,
                averageOrderValue: 0
            });
        } finally {
            setLoading(false);
        }
    };

    if (clientLoading || loading) {
        return (
            <div>
                <div className="mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-5 animate-pulse" style={{ borderColor: COLORS.border }}>
                        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-5 animate-pulse" style={{ borderColor: COLORS.border }}>
                        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded w-32 mx-auto mt-8"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Tableau de bord</h1>
                    <p className="text-sm mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Bienvenue {clientData?.contactName}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow-md transition-all group" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Équipements</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.equipments}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Package className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow-md transition-all group" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Maintenances</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.maintenances}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Wrench className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                    {stats.pendingMaintenances > 0 && (
                        <p className="text-xs mt-2" style={{ color: COLORS.accent }}>
                            {stats.pendingMaintenances} en attente
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow-md transition-all group" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Ventes</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.sales}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow-md transition-all group" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>En attente</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.pendingMaintenances}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Clock className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <Building2 className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Informations client
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Building2 className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Entreprise</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{clientData?.companyName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <User className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Contact</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{clientData?.contactName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Mail className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Email</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{clientData?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Phone className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Téléphone</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{clientData?.phone}</p>
                            </div>
                        </div>
                        {clientData?.address && (
                            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                <MapPin className="w-4 h-4" style={{ color: COLORS.accent }} />
                                <div>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Adresse</p>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{clientData?.address}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                            <Calendar className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Membre depuis</p>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                    {clientData?.createdAt ? new Date(clientData.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <TrendingUp className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Chiffre d'affaires
                    </h3>
                    <div className="text-center py-4">
                        <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                            {(stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0')} Ar
                        </p>
                        <p className="text-sm mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Total des ventes</p>
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: COLORS.border }}>
                        <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Nombre de ventes</span>
                            <span className="text-lg font-semibold" style={{ color: COLORS.accent }}>{stats.sales}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Panier moyen</span>
                            <span className="text-lg font-semibold" style={{ color: COLORS.accent }}>
                                {(stats.averageOrderValue ? stats.averageOrderValue.toLocaleString() : '0')} Ar
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {stats.maintenances > 0 && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <Wrench className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Dernières demandes de maintenance
                    </h3>
                    <div className="space-y-2">
                        {maintenances.slice(0, 3).map((maintenance) => (
                            <div key={maintenance.id} className="flex justify-between items-center p-3 rounded-lg hover:shadow-sm transition-all" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm" style={{ color: COLORS.primary }}>{maintenance.type}</p>
                                        {maintenance.status === 'PENDING' && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                                                <AlertCircle className="w-3 h-3 inline mr-0.5" />
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>{maintenance.equipment?.name}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                                    {maintenance.status === 'PENDING' ? 'En attente' :
                                        maintenance.status === 'IN_PROGRESS' ? 'En cours' :
                                            maintenance.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {maintenances.length > 3 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => window.location.href = '/client/maintenance'}
                                className="text-sm hover:underline inline-flex items-center gap-1"
                                style={{ color: COLORS.accent }}
                            >
                                Voir toutes les maintenances
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {recentSales.length > 0 && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all" style={{ borderColor: COLORS.border }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                        <ShoppingBag className="w-4 h-4" style={{ color: COLORS.accent }} />
                        Dernières ventes
                    </h3>
                    <div className="space-y-2">
                        {recentSales.slice(0, 3).map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: COLORS.primary }}>{sale.product?.name}</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: COLORS.accent }}>
                                    {sale.totalPrice?.toLocaleString()} Ar
                                </span>
                            </div>
                        ))}
                    </div>
                    {stats.sales > 3 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => window.location.href = '/client/sales'}
                                className="text-sm hover:underline inline-flex items-center gap-1"
                                style={{ color: COLORS.accent }}
                            >
                                Voir toutes les ventes
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;