// components/dashboard/DashboardContent.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Package,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import type { DashboardData, SalesByDay } from '../../types/dashboard';

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    accentLight: '#FFD54F',
    white: '#FFFFFF',
    background: '#F5F7FA',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    text: '#1A3C5E',
    textLight: 'rgba(26, 60, 94, 0.6)',
    warning: '#FFC107',
    error: '#1A3C5E',
    success: '#1A3C5E'
};

const CHART_COLORS = ['#1A3C5E', '#FFC107', '#2A5C8E', '#FFD54F', '#1A3C5E', '#FFC107'];

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + ' M Ar';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + ' k Ar';
    }
    return value.toLocaleString() + ' Ar';
};

const formatYAxis = (value: number) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
};

const KPICard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    prefix?: string;
    suffix?: string;
    trend?: number;
    loading?: boolean;
}> = ({ title, value, icon, color = COLORS.primary, prefix = '', suffix = '', trend, loading = false }) => {
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
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                    <span style={{ color }}>{icon}</span>
                </div>
                {trend !== undefined && trend !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-[#FFC107] text-[#1A3C5E]' : 'bg-[#1A3C5E] text-white'}`}>
                        {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>
                {title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {prefix}{value?.toLocaleString() || 0}{suffix}
            </p>
        </div>
    );
};


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-3 border" style={{ borderColor: COLORS.border }}>
                <p className="font-semibold text-sm mb-2" style={{ color: COLORS.primary }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.name === 'Chiffre d\'affaires (Ar)' || entry.dataKey === 'revenue'
                            ? formatCurrency(entry.value)
                            : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardContent: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [, setStockOverview] = useState<any>(null);

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

            if (dashboard?.equipmentStats) {
                const equipmentStats = dashboard.equipmentStats;
                setStockOverview({
                    highStock: equipmentStats.active || 0,
                    mediumStock: equipmentStats.maintenance || 0,
                    lowStock: equipmentStats.down || 0
                });
            }
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

    const handleRefresh = () => {
        fetchDashboardData();
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
                    <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>
                        Vue d'ensemble
                    </h2>
                    <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        {periods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setSelectedPeriod(p.value as any)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${selectedPeriod === p.value ? 'text-white' : 'hover:bg-gray-100'
                                    }`}
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
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary }}>
                        Évolution des ventes
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={salesByDay}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                            <XAxis dataKey="date" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke={COLORS.textLight} tick={{ fontSize: 12 }} tickFormatter={formatYAxis} />
                            <YAxis yAxisId="right" orientation="right" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Chiffre d'affaires (Ar)"
                                stroke={COLORS.primary}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="count"
                                name="Nombre de ventes"
                                stroke={COLORS.accent}
                                strokeWidth={2}
                                dot={{ fill: COLORS.accent, r: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary }}>
                        Top produits
                    </h3>
                    <div className="space-y-3 max-h-87.5 overflow-y-auto">
                        {topProducts && topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{product.productName}</p>
                                        <p className="text-xs" style={{ color: COLORS.textLight }}>
                                            {product.quantity} unités
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold" style={{ color: COLORS.primary }}>
                                            {formatCurrency(product.revenue)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8" style={{ color: COLORS.textLight }}>
                                Aucune donnée disponible
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5" style={{ color: COLORS.primary }} />
                        <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                            Statistiques équipements
                        </h3>
                    </div>

                    <div className="mb-5">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm" style={{ color: COLORS.textLight }}>Taux de disponibilité</span>
                            <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{equipmentStats?.availabilityRate?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${equipmentStats?.availabilityRate || 0}%`, backgroundColor: COLORS.primary }}
                            />
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
                        <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                            Alertes récentes
                        </h3>
                    </div>

                    {recentAlerts && recentAlerts.length > 0 ? (
                        <div className="space-y-3 max-h-75 overflow-y-auto">
                            {recentAlerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="p-3 rounded-lg transition-all hover:shadow-sm"
                                    style={{
                                        backgroundColor: alert.type === 'ERROR' ? `${COLORS.primary}08` :
                                            alert.type === 'WARNING' ? `${COLORS.accent}08` :
                                                `${COLORS.primary}05`,
                                        borderLeft: `3px solid ${alert.type === 'ERROR' ? COLORS.primary :
                                            alert.type === 'WARNING' ? COLORS.accent :
                                                COLORS.primary}`
                                    }}
                                >
                                    <div className="flex gap-2">
                                        {alert.type === 'ERROR' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: COLORS.primary }} />}
                                        {alert.type === 'WARNING' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: COLORS.accent }} />}
                                        {alert.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: COLORS.primary }} />}
                                        <div className="flex-1">
                                            <p className="text-sm" style={{ color: COLORS.text }}>{alert.message}</p>
                                            <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </p>
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