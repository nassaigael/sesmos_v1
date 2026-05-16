import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';

interface SalesByDay {
    date: string;
    revenue: number;
    count: number;
}

type ChartType = 'area' | 'line' | 'bar';

interface SalesChartProps {
    data: SalesByDay[];
    type?: ChartType;
    title?: string;
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    animated?: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    danger: '#DC3545',
    success: '#28A745',
    info: '#17A2B8',
    background: '#F5F7FA',
    border: 'rgba(26, 60, 94, 0.1)',
    text: '#1A3C5E',
    textLight: 'rgba(26, 60, 94, 0.6)'
};

interface TooltipPayload {
    dataKey: string;
    value: number;
    name: string;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
    unit?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = 'Ar' }) => {
    if (active && payload && payload.length) {
        const revenueItem = payload.find(p => p.dataKey === 'revenue');
        const countItem = payload.find(p => p.dataKey === 'count');

        return (
            <div className="bg-white rounded-xl shadow-lg p-4 border" style={{ borderColor: COLORS.border, minWidth: '200px' }}>
                <p className="font-semibold text-base mb-3 pb-2 border-b" style={{ color: COLORS.primary, borderColor: COLORS.border }}>
                    {label}
                </p>
                <div className="space-y-2">
                    {revenueItem && (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                                <span className="text-sm" style={{ color: COLORS.textLight }}>CA</span>
                            </div>
                            <span className="font-semibold text-sm" style={{ color: COLORS.primary }}>
                                {revenueItem.value?.toLocaleString()} {unit}
                            </span>
                        </div>
                    )}
                    {countItem && (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.accent }} />
                                <span className="text-sm" style={{ color: COLORS.textLight }}>Ventes</span>
                            </div>
                            <span className="font-semibold text-sm" style={{ color: COLORS.accent }}>
                                {countItem.value} unité{countItem.value > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

interface ChartTypeSelectorProps {
    currentType: ChartType;
    onTypeChange: (type: ChartType) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ currentType, onTypeChange }) => {
    const types: { value: ChartType; icon: React.ReactNode; label: string }[] = [
        { value: 'area', icon: <AreaChartIcon className="w-4 h-4" />, label: 'Aire' },
        { value: 'line', icon: <LineChartIcon className="w-4 h-4" />, label: 'Ligne' },
        { value: 'bar', icon: <BarChart3 className="w-4 h-4" />, label: 'Barres' }
    ];

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {types.map(type => (
                <button
                    key={type.value}
                    onClick={() => onTypeChange(type.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${currentType === type.value
                            ? 'bg-white text-[#1A3C5E] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {type.icon}
                    <span className="hidden sm:inline">{type.label}</span>
                </button>
            ))}
        </div>
    );
};

interface CustomLegendProps {
    payload?: Array<{ value: string; color: string; dataKey: string }>;
}

const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
    if (!payload) return null;

    return (
        <div className="flex items-center justify-center gap-6 mt-4 pt-2">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm" style={{ color: COLORS.textLight }}>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export const SalesChart: React.FC<SalesChartProps> = ({
    data,
    type = 'area',
    title,
    height = 400,
    showLegend = true,
    showGrid = true,
    animated = true
}) => {
    const [chartType, setChartType] = useState<ChartType>(type);
    const [showRevenue, setShowRevenue] = useState(true);
    const [showCount, setShowCount] = useState(true);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center" style={{ height }}>
                <div className="flex flex-col items-center justify-center h-full">
                    <Activity className="w-12 h-12 mb-3" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <p className="text-sm" style={{ color: COLORS.textLight }}>Aucune donnée disponible</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight, opacity: 0.6 }}>Sélectionnez une autre période</p>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        revenue: item.revenue,
        count: item.count
    }));

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    const averageRevenue = totalCount > 0 ? totalRevenue / totalCount : 0;

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />}
                        <XAxis dataKey="date" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" stroke={COLORS.textLight} tick={{ fontSize: 12 }} tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend content={<CustomLegend />} />}
                        {showRevenue && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Chiffre d'affaires (Ar)"
                                stroke={COLORS.primary}
                                strokeWidth={2}
                                dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={animated}
                            />
                        )}
                        {showCount && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="count"
                                name="Nombre de ventes"
                                stroke={COLORS.accent}
                                strokeWidth={2}
                                dot={{ r: 4, fill: COLORS.accent, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={animated}
                            />
                        )}
                    </LineChart>
                );
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />}
                        <XAxis dataKey="date" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" stroke={COLORS.textLight} tick={{ fontSize: 12 }} tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend content={<CustomLegend />} />}
                        {showRevenue && (
                            <Bar
                                yAxisId="left"
                                dataKey="revenue"
                                name="Chiffre d'affaires (Ar)"
                                fill={COLORS.primary}
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={animated}
                            />
                        )}
                        {showCount && (
                            <Bar
                                yAxisId="right"
                                dataKey="count"
                                name="Nombre de ventes"
                                fill={COLORS.accent}
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={animated}
                            />
                        )}
                    </BarChart>
                );
            default:
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />}
                        <XAxis dataKey="date" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" stroke={COLORS.textLight} tick={{ fontSize: 12 }} tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.textLight} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend content={<CustomLegend />} />}
                        {showRevenue && (
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Chiffre d'affaires (Ar)"
                                stroke={COLORS.primary}
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                                isAnimationActive={animated}
                            />
                        )}
                        {showCount && (
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="count"
                                name="Nombre de ventes"
                                stroke={COLORS.accent}
                                strokeWidth={2}
                                fill="url(#colorCount)"
                                isAnimationActive={animated}
                            />
                        )}
                    </AreaChart>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {title && (
                <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: COLORS.border }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}10` }}>
                                    <TrendingUp className="w-4 h-4" style={{ color: COLORS.primary }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>{title}</h3>
                                    <p className="text-xs" style={{ color: COLORS.textLight }}>Évolution des ventes dans le temps</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ChartTypeSelector currentType={chartType} onTypeChange={setChartType} />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 px-6 pt-4 pb-2">
                <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: COLORS.textLight }}>CA Total</p>
                    <p className="text-lg font-bold" style={{ color: COLORS.primary }}>
                        {totalRevenue.toLocaleString()} Ar
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: COLORS.textLight }}>Ventes totales</p>
                    <p className="text-lg font-bold" style={{ color: COLORS.accent }}>
                        {totalCount}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: COLORS.textLight }}>Panier moyen</p>
                    <p className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                        {averageRevenue.toLocaleString()} Ar
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-2">
                <button
                    onClick={() => setShowRevenue(!showRevenue)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all"
                    style={{
                        backgroundColor: showRevenue ? `${COLORS.primary}10` : 'transparent',
                        color: showRevenue ? COLORS.primary : COLORS.textLight
                    }}
                >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                    CA
                </button>
                <button
                    onClick={() => setShowCount(!showCount)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all"
                    style={{
                        backgroundColor: showCount ? `${COLORS.accent}10` : 'transparent',
                        color: showCount ? COLORS.accent : COLORS.textLight
                    }}
                >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.accent }} />
                    Ventes
                </button>
            </div>

            <div className="p-4" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;