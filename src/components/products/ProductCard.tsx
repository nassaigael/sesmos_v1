// components/products/ProductCard.tsx
import React, { useState } from 'react';
import { Edit, Trash2, Package, AlertTriangle, TrendingUp, ShoppingCart, Eye, Tag } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductCardProps {
    product: Product;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#1A3C5E',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    danger: '#DC3545'
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getStockStatus = () => {
        if (product.stockQuantity <= 0) {
            return {
                color: COLORS.danger,
                bgColor: '#1A3C5E',
                text: 'Rupture',
                label: 'En rupture de stock'
            };
        }
        if (product.stockQuantity <= product.minimumStock) {
            return {
                color: COLORS.warning,
                bgColor: '#1A3C5E',
                text: 'Stock faible',
                label: `${product.stockQuantity} ${product.unit} restant(s)`
            };
        }
        return {
            color: '#FFFFFF',
            bgColor: '#1A3C5E',
            text: 'En stock',
            label: `${product.stockQuantity} disponible(s)`
        };
    };

    const stockStatus = getStockStatus();
    const stockPercentage = Math.min(100, Math.round((product.stockQuantity / (product.minimumStock * 2)) * 100));

    const truncateText = (text: string, maxLength: number = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            className="group relative rounded-2xl border-6 border-[#1A3C5E] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            style={{
                backgroundColor: COLORS.primary,
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute top-3 right-3 z-10">
                <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                    style={{
                        backgroundColor: stockStatus.bgColor,
                        color: stockStatus.color,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{stockStatus.text}</span>
                </div>
            </div>

            <div className="absolute top-3 left-3 z-10">
                <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: COLORS.primary }}
                >
                    <Tag className="w-3 h-3" />
                    <span>{product.categoryDisplayName || product.category}</span>
                </div>
            </div>

            <div className="relative bg-white rounded-t-2xl overflow-hidden cursor-pointer" style={{ margin: '1px' }} onClick={() => onView(product)}>
                <div className="h-56 bg-linear-to-br from-gray-50 to-gray-100">
                    {product.imageUrl && !imageError ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <Package className="w-14 h-14" style={{ color: COLORS.primary, opacity: 0.2 }} />
                            <span className="text-xs mt-2" style={{ color: COLORS.text, opacity: 0.4 }}>Aucune image</span>
                        </div>
                    )}
                </div>

                <div
                    className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0.2 : 0 }}
                />

                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(product);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                        style={{ color: COLORS.primary }}
                    >
                        <Eye className="w-4 h-4" />
                        Voir détails
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div onClick={() => onView(product)} className="cursor-pointer">
                    <h3
                        className="text-base font-bold mb-1 line-clamp-2"
                        style={{ color: COLORS.white }}
                        title={product.name}
                    >
                        {truncateText(product.name, 50)}
                    </h3>

                    {product.description && (
                        <p className="text-xs mb-2 line-clamp-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {truncateText(product.description, 70)}
                        </p>
                    )}

                    <div className="mb-2">
                        <span className="text-xl font-bold" style={{ color: COLORS.warning }}>
                            {product.price.toLocaleString()} Ar
                        </span>
                        <span className="text-xs ml-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>TTC</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs mb-2 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{product.unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                        <span style={{ color: stockStatus.color, fontWeight: 500 }}>{stockStatus.label}</span>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${stockPercentage}%`,
                                backgroundColor: product.stockQuantity <= product.minimumStock ? COLORS.warning : COLORS.white
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: COLORS.warning }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(product.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: COLORS.danger }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;