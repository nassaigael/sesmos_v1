// components/sales/SalesAnalytics.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Award, MapPin, Calendar } from 'lucide-react';
import saleService from '../../services/saleService';
import type { SalesStats } from '../../types/sales';

interface SalesAnalyticsProps {
    period?: 'week' | 'month' | 'year';
    onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
    dateRange?: { startDate: string; endDate: string };
    onDateRangeChange?: (range: { startDate: string; endDate: string }) => void;
}

const COLORS = ['#1A3C5E', '#FFC107', '#28A745', '#DC3545', '#6C757D', '#17A2B8', '#FD7E14', '#20B2AA'];

const formatYAxis = (value: number) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
};

const formatTooltipValue = (value: number, name: string) => {
    if (name === 'CA (Ar)' || name === 'revenue') {
        return `${value.toLocaleString()} Ar`;
    }
    if (name === 'count' || name === 'Nombre ventes') {
        return `${value} vente${value > 1 ? 's' : ''}`;
    }
    return value;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-3 border" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                <p className="font-semibold text-sm mb-2" style={{ color: '#1A3C5E' }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatTooltipValue(entry.value, entry.name)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
    period: externalPeriod,
    onPeriodChange,
    dateRange: externalDateRange,
    onDateRangeChange
}) => {
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>(externalPeriod || 'month');
    const [dateRange, setDateRange] = useState(externalDateRange || { startDate: '', endDate: '' });

    useEffect(() => {
        if (externalPeriod) setPeriod(externalPeriod);
    }, [externalPeriod]);

    useEffect(() => {
        if (externalDateRange) setDateRange(externalDateRange);
    }, [externalDateRange]);

    useEffect(() => {
        loadStats();
    }, [period, dateRange]);

    const loadStats = async () => {
        try {
            setLoading(true);
            let startDate = dateRange.startDate;
            let endDate = dateRange.endDate;

            if (!startDate && !endDate) {
                const now = new Date();
                if (period === 'week') {
                    const weekAgo = new Date(now);
                    weekAgo.setDate(now.getDate() - 7);
                    startDate = weekAgo.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                } else if (period === 'month') {
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(now.getMonth() - 1);
                    startDate = monthAgo.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                } else if (period === 'year') {
                    const yearAgo = new Date(now);
                    yearAgo.setFullYear(now.getFullYear() - 1);
                    startDate = yearAgo.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                }
            }

            const data = await saleService.getSalesStats(startDate, endDate);
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
        setPeriod(newPeriod);
        setDateRange({ startDate: '', endDate: '' });
        onPeriodChange?.(newPeriod);
        onDateRangeChange?.({ startDate: '', endDate: '' });
    };

    const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
        const newRange = { ...dateRange, [field]: value };
        setDateRange(newRange);
        onDateRangeChange?.(newRange);
    };

    const salesByMonth = useMemo(() => {
        if (!stats?.salesByDay) return [];
        const monthMap = new Map<string, { month: string; revenue: number; count: number }>();

        stats.salesByDay.forEach(item => {
            const month = item.date.substring(0, 7);
            if (!monthMap.has(month)) {
                monthMap.set(month, { month, revenue: 0, count: 0 });
            }
            const existing = monthMap.get(month)!;
            existing.revenue += item.revenue;
            existing.count += item.count;
        });

        return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }, [stats?.salesByDay]);

    const topProducts = useMemo(() => {
        if (!stats?.salesByProduct) return [];
        return stats.salesByProduct
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(p => ({ name: p.productName, value: p.revenue }));
    }, [stats?.salesByProduct]);

    const salesByRegion = useMemo(() => {
        if (!stats?.salesByRegion) return [];
        return stats.salesByRegion
            .sort((a, b) => b.revenue - a.revenue)
            .map(r => ({ name: r.regionName, value: r.revenue }));
    }, [stats?.salesByRegion]);

    const renderCustomLabel = (entry: any) => {
        const { name, percent } = entry;
        if (percent && percent > 0.05) {
            return `${name}: ${(percent * 100).toFixed(0)}%`;
        }
        return '';
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + ' M Ar';
        }
        return value.toLocaleString() + ' Ar';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePeriodChange('week')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'week'
                                ? 'text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            style={period === 'week' ? { backgroundColor: '#1A3C5E' } : { color: '#1A3C5E' }}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Semaine
                        </button>
                        <button
                            onClick={() => handlePeriodChange('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'month'
                                ? 'text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            style={period === 'month' ? { backgroundColor: '#1A3C5E' } : { color: '#1A3C5E' }}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Mois
                        </button>
                        <button
                            onClick={() => handlePeriodChange('year')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'year'
                                ? 'text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            style={period === 'year' ? { backgroundColor: '#1A3C5E' } : { color: '#1A3C5E' }}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Année
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                            style={{ borderColor: 'rgba(26, 60, 94, 0.2)' }}
                            placeholder="Date début"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                            style={{ borderColor: 'rgba(26, 60, 94, 0.2)' }}
                            placeholder="Date fin"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <DollarSign className="w-5 h-5" style={{ color: '#1A3C5E' }} />
                        </div>
                        <span className="text-2xl font-bold" style={{ color: '#FFC107' }}>
                            {formatCurrency(stats?.totalRevenue || 0)}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: '#1A3C5E', opacity: 0.7 }}>Chiffre d'affaires total</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: '#1A3C5E' }} />
                        </div>
                        <span className="text-2xl font-bold" style={{ color: '#FFC107' }}>
                            {stats?.totalSales || 0}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: '#1A3C5E', opacity: 0.7 }}>Nombre total de ventes</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <TrendingUp className="w-5 h-5" style={{ color: '#1A3C5E' }} />
                        </div>
                        <span className="text-2xl font-bold" style={{ color: '#FFC107' }}>
                            {formatCurrency(stats?.averageOrderValue || 0)}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: '#1A3C5E', opacity: 0.7 }}>Panier moyen</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <Award className="w-5 h-5" style={{ color: '#1A3C5E' }} />
                        </div>
                        <span className="text-sm font-semibold text-right" style={{ color: '#1A3C5E' }}>
                            {stats?.bestProduct?.name || '-'}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: '#1A3C5E', opacity: 0.7 }}>Meilleur produit</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A3C5E' }}>
                        Évolution des ventes
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.salesByDay || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    interval="preserveStartEnd"
                                    angle={-25}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={formatYAxis}
                                    width={60}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11 }}
                                    width={40}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="CA (Ar)"
                                    stroke="#1A3C5E"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#1A3C5E' }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="count"
                                    name="Nombre ventes"
                                    stroke="#FFC107"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#FFC107' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A3C5E' }}>
                        Top 5 produits
                    </h3>
                    <div className="h-80">
                        {topProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Aucune donnée disponible
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topProducts}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {topProducts.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A3C5E' }}>
                        Ventes par mois
                    </h3>
                    <div className="h-80">
                        {salesByMonth.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Aucune donnée disponible
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                        angle={-25}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={formatYAxis}
                                        width={60}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fontSize: 11 }}
                                        width={40}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar yAxisId="left" dataKey="revenue" name="CA (Ar)" fill="#1A3C5E" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="count" name="Nombre ventes" fill="#FFC107" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5" style={{ color: '#1A3C5E' }} />
                        <h3 className="text-lg font-semibold" style={{ color: '#1A3C5E' }}>
                            Ventes par région
                        </h3>
                    </div>
                    <div className="h-80">
                        {salesByRegion.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Aucune donnée disponible
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={salesByRegion}
                                    layout="vertical"
                                    margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(value) => formatYAxis(value)}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        width={80}
                                    />
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="value" name="CA (Ar)" fill="#FFC107" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-linear-to-r from-[#1A3C5E] to-[#2A5C8E] rounded-xl shadow-md p-4 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-white/70 text-sm">Meilleure région</p>
                        <p className="text-2xl font-bold">{stats?.bestRegion?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">Chiffre d'affaires</p>
                        <p className="text-2xl font-bold text-[#FFC107]">
                            {formatCurrency(stats?.bestRegion?.revenue || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">Meilleur produit</p>
                        <p className="text-lg font-semibold">{stats?.bestProduct?.name || '-'}</p>
                        <p className="text-sm text-white/70">
                            {stats?.bestProduct?.quantity || 0} unités - {formatCurrency(stats?.bestProduct?.revenue || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;