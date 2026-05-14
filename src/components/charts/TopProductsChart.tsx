// components/charts/TopProductsChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ProductSales } from '../../types/dashboard';
import { Package } from 'lucide-react';

interface TopProductsChartProps {
    data: ProductSales[];
}

const COLORS = ['#1A3C5E', '#F5A623', '#28A745', '#DC3545', '#6C757D', '#17A2B8', '#FFC107', '#007BFF'];

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
    const chartData = data.map(product => ({
        name: product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName,
        value: product.revenue,
        quantity: product.quantity,
        fullName: product.productName
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
                        {data.fullName}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                        CA: {data.value?.toLocaleString()} Ar
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                        Quantité: {data.quantity} unités
                    </p>
                </div>
            );
        }
        return null;
    };

    // Fonction de rendu du label avec vérification de sécurité
    const renderLabel = (entry: any) => {
        const { name, percent } = entry;
        // Vérifier que percent existe et est supérieur à 5%
        if (percent && percent > 0.05) {
            return `${name}: ${(percent * 100).toFixed(0)}%`;
        }
        return '';
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                    Top produits (CA)
                </h3>
            </div>
            <div style={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};