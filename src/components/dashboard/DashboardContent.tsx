// components/dashboard/DashboardContent.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
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
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    RefreshCw,
    Calendar,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import type { DashboardData, SalesByDay } from '../../types/dashboard';

const COLORS = ['#1A3C5E', '#F5A623', '#28A745', '#DC3545', '#6C757D', '#17A2B8', '#FFC107', '#007BFF'];

// Composant de carte KPI
const KPICard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    prefix?: string;
    suffix?: string;
    trend?: number;
    loading?: boolean;
}> = ({ title, value, icon, color = 'var(--color-primary)', prefix = '', suffix = '', trend, loading = false }) => {
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
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                {title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {prefix}{value?.toLocaleString() || 0}{suffix}
            </p>
        </div>
    );
};

// Composant d'aperçu rapide du stock
const StockOverview: React.FC<{ data: any }> = ({ data }) => {
    const levels = [
        { label: 'Stock élevé', value: data?.highStock || 0, color: '#28A745' },
        { label: 'Stock moyen', value: data?.mediumStock || 0, color: '#F5A623' },
        { label: 'Stock faible', value: data?.lowStock || 0, color: '#DC3545' }
    ];
    const total = levels.reduce((sum, l) => sum + l.value, 0);

    return (
        <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
                Aperçu du stock
            </h3>
            <div className="space-y-3">
                {levels.map((level) => (
                    <div key={level.label}>
                        <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: 'var(--color-text)' }}>{level.label}</span>
                            <span className="font-medium" style={{ color: level.color }}>{level.value} produits</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${total > 0 ? (level.value / total) * 100 : 0}%`, backgroundColor: level.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
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
    const [stockOverview, setStockOverview] = useState<any>(null);

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

            // Calculer l'aperçu du stock
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }} />
                    <p className="mt-4" style={{ color: 'var(--color-text)' }}>Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec période et rafraîchissement */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        Vue d'ensemble
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                        {periods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setSelectedPeriod(p.value as any)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${selectedPeriod === p.value ? 'text-white' : 'hover:bg-gray-100'
                                    }`}
                                style={selectedPeriod === p.value ? { backgroundColor: 'var(--color-primary)' } : {}}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--color-primary)' }} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
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

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Évolution des ventes */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Évolution des ventes
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={salesByDay}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="date" stroke="var(--color-text)" />
                            <YAxis stroke="var(--color-text)" />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Chiffre d'affaires (Ar)"
                                stroke="var(--color-primary)"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                name="Nombre de ventes"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-accent)', r: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top produits */}
                <div className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Top produits
                    </h3>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                        {topProducts && topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{product.productName}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text)', opacity: 0.5 }}>
                                            {product.quantity} unités
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                                            {product.revenue.toLocaleString()} Ar
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8" style={{ color: 'var(--color-text)', opacity: 0.5 }}>
                                Aucune donnée disponible
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Deuxième ligne */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statistiques équipements */}
                <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                            Statistiques équipements
                        </h3>
                    </div>

                    <div className="mb-5">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Taux de disponibilité</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{equipmentStats?.availabilityRate?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${equipmentStats?.availabilityRate || 0}%`, backgroundColor: 'var(--color-success)' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{equipmentStats?.active || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text)' }}>Actifs</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{equipmentStats?.maintenance || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text)' }}>Maintenance</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-danger)' }}>{equipmentStats?.down || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text)' }}>Hors service</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{equipmentStats?.total || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text)' }}>Total</p>
                        </div>
                    </div>
                </div>

                {/* Alertes récentes */}
                <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                            Alertes récentes
                        </h3>
                    </div>

                    {recentAlerts && recentAlerts.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {recentAlerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="p-3 rounded-lg transition-all hover:shadow-sm"
                                    style={{
                                        backgroundColor: alert.type === 'ERROR' ? 'rgba(220, 53, 69, 0.05)' :
                                            alert.type === 'WARNING' ? 'rgba(255, 193, 7, 0.05)' :
                                                'rgba(40, 167, 69, 0.05)',
                                        borderLeft: `3px solid ${alert.type === 'ERROR' ? 'var(--color-danger)' :
                                            alert.type === 'WARNING' ? 'var(--color-warning)' :
                                                'var(--color-success)'}`
                                    }}
                                >
                                    <div className="flex gap-2">
                                        {alert.type === 'ERROR' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-danger)' }} />}
                                        {alert.type === 'WARNING' && <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-warning)' }} />}
                                        {alert.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-success)' }} />}
                                        <div className="flex-1">
                                            <p className="text-sm" style={{ color: 'var(--color-text)' }}>{alert.message}</p>
                                            <p className="text-xs mt-1" style={{ opacity: 0.5 }}>
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-success)', opacity: 0.5 }} />
                            <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.5 }}>Aucune alerte récente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;