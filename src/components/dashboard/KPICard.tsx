// components/Dashboard/KPICard.tsx
import React from 'react';

interface KPICardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    prefix?: string;
    suffix?: string;
    trend?: number;
    loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    color = 'var(--color-primary)',
    prefix = '',
    suffix = '',
    trend,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="rounded-xl shadow-md p-6 animate-pulse" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: 'var(--color-surface-light)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                    <span style={{ color }}>{icon}</span>
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trend >= 0 ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                            </svg>
                        )}
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