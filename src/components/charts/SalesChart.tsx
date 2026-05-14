// components/charts/SalesChart.tsx
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import type { SalesByDay } from '../../types/dashboard';
import { TrendingUp } from 'lucide-react';

interface SalesChartProps {
    data: SalesByDay[];
    type?: 'line' | 'area' | 'bar';
    title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
                    {label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                    Chiffre d'affaires: {payload[0]?.value?.toLocaleString()} Ar
                </p>
                {payload[1] && (
                    <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
                        Ventes: {payload[1]?.value} unités
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export const SalesChart: React.FC<SalesChartProps> = ({ data, type = 'area', title }) => {
    const chartData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    }));

    return (
        <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {title}
                    </h3>
                </div>
            )}
            <div style={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" stroke="var(--color-text)" />
                        <YAxis stroke="var(--color-text)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Chiffre d'affaires (Ar)"
                            stroke="var(--color-primary)"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};