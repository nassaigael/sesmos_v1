import React, { useEffect, useState, useCallback } from 'react';
import {
    TrendingUp, DollarSign, ShoppingBag, Package, AlertTriangle, CheckCircle, RefreshCw, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import type { DashboardData, SalesByDay } from '../../services/dashboardService';
import SalesChart from './SalesChart';
import TopProducts from './TopProducts';

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    background: '#F5F7FA',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    textLight: 'rgba(26, 60, 94, 0.6)'
};

const KPICard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    suffix?: string;
    trend?: number;
    loading?: boolean;
}> = ({ title, value, icon, color = COLORS.primary, suffix = '', trend, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                    <span style={{ color }}>{icon}</span>
                </div>
                {trend !== undefined && trend !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-[#FFC107] text-[#1A3C5E]' : 'bg-[#1A3C5E] text-white'}`}>
                        {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>{title}</h3>
            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {value?.toLocaleString() || 0}{suffix}
            </p>
        </div>
    );
};

const DashboardContent: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);

    const periods = [
        { value: '7d', label: '7 jours', days: 7 },
        { value: '30d', label: '30 jours', days: 30 },
        { value: '90d', label: '90 jours', days: 90 },
        { value: '12m', label: '12 mois', days: 365 }
    ];

    const fetchDashboardData = useCallback(async () => {
        try {
            setRefreshing(true);
            const [dashboard, salesData] = await Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getSalesByDay(parseInt(selectedPeriod))
            ]);
            setDashboardData(dashboard);
            setSalesByDay(salesData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRefresh = () => fetchDashboardData();

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const blob = await dashboardService.exportDashboardReport('excel');
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard_rapport_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            setExporting(false);
        }
    };

    const { salesSummary, topProducts, equipmentStats, recentAlerts } = dashboardData || {};

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: COLORS.primary }} />
                    <p className="mt-4" style={{ color: COLORS.textLight }}>Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>Vue d'ensemble</h2>
                    <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-50"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                    >
                        {exporting ? (
                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.primary }} />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span className="text-sm">Exporter Excel</span>
                    </button>
                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        {periods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setSelectedPeriod(p.value as any)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${selectedPeriod === p.value ? 'text-white' : 'hover:bg-gray-100'}`}
                                style={selectedPeriod === p.value ? { backgroundColor: COLORS.primary } : { color: COLORS.primary }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50"
                        style={{ borderColor: COLORS.border }}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: COLORS.primary }} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    title="Chiffre d'affaires"
                    value={salesSummary?.totalRevenue || 0}
                    icon={<DollarSign className="w-6 h-6" />}
                    suffix=" Ar"
                    trend={salesSummary?.growthRate}
                    loading={loading}
                />
                <KPICard
                    title="Ventes"
                    value={salesSummary?.totalSales || 0}
                    icon={<ShoppingBag className="w-6 h-6" />}
                    loading={loading}
                />
                <KPICard
                    title="Produits"
                    value={topProducts?.length || 0}
                    icon={<Package className="w-6 h-6" />}
                    loading={loading}
                />
                <KPICard
                    title="Disponibilité"
                    value={equipmentStats?.availabilityRate || 0}
                    icon={<TrendingUp className="w-6 h-6" />}
                    suffix="%"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={salesByDay} />
                </div>

                <div className="h-125">
                    <TopProducts products={topProducts || []} height={500} loading={loading} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5" style={{ color: COLORS.primary }} />
                        <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>Statistiques équipements</h3>
                    </div>
                    <div className="mb-5">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm" style={{ color: COLORS.textLight }}>Taux de disponibilité</span>
                            <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{equipmentStats?.availabilityRate?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${equipmentStats?.availabilityRate || 0}%`, backgroundColor: COLORS.primary }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.primary}10` }}>
                            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{equipmentStats?.active || 0}</p>
                            <p className="text-xs" style={{ color: COLORS.textLight }}>Actifs</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.accent}10` }}>
                            <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{equipmentStats?.maintenance || 0}</p>
                            <p className="text-xs" style={{ color: COLORS.textLight }}>Maintenance</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.primaryLight}10` }}>
                            <p className="text-2xl font-bold" style={{ color: COLORS.primaryLight }}>{equipmentStats?.down || 0}</p>
                            <p className="text-xs" style={{ color: COLORS.textLight }}>Hors service</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.primary}10` }}>
                            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{equipmentStats?.total || 0}</p>
                            <p className="text-xs" style={{ color: COLORS.textLight }}>Total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: COLORS.accent }} />
                        <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>Alertes récentes</h3>
                    </div>
                    {recentAlerts && recentAlerts.length > 0 ? (
                        <div className="space-y-3 max-h-85 overflow-y-auto">
                            {recentAlerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="p-3 rounded-lg transition-all hover:shadow-sm"
                                    style={{
                                        backgroundColor: alert.type === 'ERROR' ? `${COLORS.primary}08` :
                                            alert.type === 'WARNING' ? `${COLORS.accent}08` : `${COLORS.primary}05`,
                                        borderLeft: `3px solid ${alert.type === 'ERROR' ? COLORS.primary :
                                            alert.type === 'WARNING' ? COLORS.accent : COLORS.primary}`
                                    }}
                                >
                                    <div className="flex gap-2">
                                        {alert.type === 'ERROR' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: COLORS.primary }} />}
                                        {alert.type === 'WARNING' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: COLORS.accent }} />}
                                        {alert.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: COLORS.primary }} />}
                                        <div className="flex-1">
                                            <p className="text-sm" style={{ color: COLORS.primary }}>{alert.message}</p>
                                            <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>{new Date(alert.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2" style={{ color: COLORS.primary, opacity: 0.3 }} />
                            <p className="text-sm" style={{ color: COLORS.textLight }}>Aucune alerte récente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;