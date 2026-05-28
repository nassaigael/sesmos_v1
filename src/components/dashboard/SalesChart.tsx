import React, { useState, useEffect } from 'react';
import {
    Line, Bar, Area, AreaChart, BarChart, LineChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, BarChart2, TrendingUp, Activity } from 'lucide-react';

interface SalesData {
    date: string;
    revenue: number;
    sales: number;
}

interface SalesChartProps {
    data: SalesData[];
    title?: string;
    height?: number;
    onPeriodChange?: (period: string) => void;
    onChartTypeChange?: (type: string) => void;
}

type ChartType = 'area' | 'line' | 'bar';
type PeriodType = 'day' | 'week' | 'month' | 'year';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    textLight: 'rgba(26, 60, 94, 0.6)',
    white: '#FFFFFF',
    gray: '#6C757D'
};


const formatYAxis = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-3 border" style={{ borderColor: COLORS.border }}>
                <p className="font-semibold text-sm mb-2" style={{ color: COLORS.primary }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.dataKey === 'revenue' ? entry.value.toLocaleString() + ' Ar' : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: 'area', label: 'Aire', icon: <Activity className="w-4 h-4" /> },
    { value: 'line', label: 'Courbe', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'bar', label: 'Barres', icon: <BarChart2 className="w-4 h-4" /> }
];

const periods: { value: PeriodType; label: string; days: number }[] = [
    { value: 'day', label: 'Jour', days: 1 },
    { value: 'week', label: 'Semaine', days: 7 },
    { value: 'month', label: 'Mois', days: 30 },
    { value: 'year', label: 'Année', days: 365 }
];

const SalesChart: React.FC<SalesChartProps> = ({
    data,
    title = "Évolution des ventes",
    height = 280,
    onPeriodChange,
    onChartTypeChange
}) => {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

    useEffect(() => {
        if (onPeriodChange) onPeriodChange(selectedPeriod);
    }, [selectedPeriod, onPeriodChange]);

    useEffect(() => {
        if (onChartTypeChange) onChartTypeChange(chartType);
    }, [chartType, onChartTypeChange]);

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            tickFormatter={formatYAxis}
                            width={60}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar
                            yAxisId="left"
                            dataKey="revenue"
                            name="Chiffre d'affaires"
                            fill={COLORS.primary}
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="sales"
                            name="Nombre de ventes"
                            fill={COLORS.accent}
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            tickFormatter={formatYAxis}
                            width={60}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name="Chiffre d'affaires"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="sales"
                            name="Nombre de ventes"
                            stroke={COLORS.accent}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                );
            default:
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            tickFormatter={formatYAxis}
                            width={60}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={COLORS.textLight}
                            tick={{ fontSize: 11 }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name="Chiffre d'affaires"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="sales"
                            name="Nombre de ventes"
                            stroke={COLORS.accent}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div>
                    <h3 className="text-base font-semibold" style={{ color: COLORS.primary }}>{title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textLight }}>
                        Chiffre d'affaires vs Nombre de ventes
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        {periods.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${selectedPeriod === period.value ? 'text-white shadow-sm' : 'hover:bg-gray-100'
                                    }`}
                                style={selectedPeriod === period.value ? { backgroundColor: COLORS.primary } : { color: COLORS.primary }}
                            >
                                <Calendar className="w-3 h-3" />
                                {period.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        {chartTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setChartType(type.value)}
                                className={`px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${chartType === type.value ? 'text-white shadow-sm' : 'hover:bg-gray-100'
                                    }`}
                                style={chartType === type.value ? { backgroundColor: COLORS.primary } : { color: COLORS.primary }}
                            >
                                {type.icon}
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                    <span style={{ color: COLORS.textLight }}>Chiffre d'affaires (Ar)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.accent }} />
                    <span style={{ color: COLORS.textLight }}>Nombre de ventes</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>

            <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs" style={{ borderColor: COLORS.border, color: COLORS.textLight }}>
                <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Tendance à la hausse</span>
                </div>
                <div>
                    Dernière mise à jour: {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default SalesChart;