import React from 'react';
import { Package, Trophy } from 'lucide-react';
import type { ProductSales } from '../../services/dashboardService';

interface TopProductsProps {
    products: ProductSales[];
    title?: string;
    height?: number;
    loading?: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    textLight: 'rgba(26, 60, 94, 0.6)'
};

const CHART_COLORS = ['#1A3C5E', '#FFC107', '#2A5C8E', '#FFD54F'];

const formatCurrency = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M Ar';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k Ar';
    return value.toLocaleString() + ' Ar';
};

const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-amber-600" />;
    return null;
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getProductImageUrl = (product: ProductSales): string | null => {
    if (product.imageUrl && product.imageUrl.trim() !== '') {
        return product.imageUrl;
    }
    return null;
};

const TopProducts: React.FC<TopProductsProps> = ({
    products,
    title = "Top produits",
    loading = false
}) => {
    const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

    const handleImageError = (productId: string) => {
        setImageErrors(prev => ({ ...prev, [productId]: true }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-5 h-full flex flex-col">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-5 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-5 h-full flex flex-col items-center justify-center">
                <Package className="w-12 h-12 mb-3 opacity-30" style={{ color: COLORS.primary }} />
                <p className="text-sm text-center" style={{ color: COLORS.textLight }}>Aucune donnée produit disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold" style={{ color: COLORS.primary }}>{title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textLight }}>
                        Meilleures performances
                    </p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                    {products.length} produits
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {products.map((product, index) => {
                    const revenuePercent = Math.min((product.revenue / (products[0]?.revenue || 1)) * 100, 100);
                    const rankColor = CHART_COLORS[index % CHART_COLORS.length];
                    const rankIcon = getRankIcon(index);
                    const hasImageError = imageErrors[product.productId];
                    const imageUrl = getProductImageUrl(product);

                    return (
                        <div key={product.productId} className="p-3 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-b-0" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-3">
                                <div className="shrink-0">
                                    {rankIcon ? (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                                            {rankIcon}
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: rankColor }}>
                                            {index + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0">
                                    {imageUrl && !hasImageError ? (
                                        <img
                                            src={imageUrl}
                                            alt={product.productName}
                                            className="w-10 h-10 rounded-lg object-cover border"
                                            style={{ borderColor: COLORS.border }}
                                            onError={() => handleImageError(product.productId)}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                            <span className="text-xs font-bold" style={{ color: COLORS.accent }}>
                                                {getInitials(product.productName)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm truncate" style={{ color: COLORS.primary }}>
                                            {product.productName}
                                        </p>
                                        <p className="text-sm font-semibold shrink-0" style={{ color: COLORS.primary }}>
                                            {formatCurrency(product.revenue)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs" style={{ color: COLORS.textLight }}>
                                            {product.quantity} unités vendues
                                        </p>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${revenuePercent}%`, backgroundColor: rankColor }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopProducts;