import React, { useState } from 'react';
import { X, Package, ShoppingCart, Tag, Calendar, AlertTriangle, ZoomIn } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductDetailProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onEdit?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#1A3C5E',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ProductDetail: React.FC<ProductDetailProps> = ({ isOpen, onClose, product, onEdit }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const getStockStatus = () => {
        if (product.stockQuantity <= 0) {
            return { color: '#DC3545', bgColor: 'rgba(220, 53, 69, 0.12)', text: 'Rupture de stock' };
        }
        if (product.stockQuantity <= product.minimumStock) {
            return { color: COLORS.warning, bgColor: 'rgba(255, 193, 7, 0.12)', text: 'Stock faible' };
        }
        return { color: COLORS.primary, bgColor: 'rgba(26, 60, 94, 0.08)', text: 'En stock' };
    };

    const stockStatus = getStockStatus();
    const stockPercentage = Math.min(100, (product.stockQuantity / (product.minimumStock * 2)) * 100);

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:inset-auto">
                <div className="flex items-center justify-center min-h-screen px-4 py-8">
                    <div
                        className="fixed inset-0 backdrop-blur-md transition-all duration-300 print:hidden"
                        style={{ backgroundColor: 'rgba(26, 60, 94, 0.4)' }}
                        onClick={onClose}
                    />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl print:shadow-none overflow-hidden transform transition-all duration-300 scale-100">
                        <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                            <div className="absolute bottom-4 left-6">
                                <h2 className="text-white font-bold text-lg">Détail du produit</h2>
                                <p className="text-white/70 text-xs">Informations complètes sur le produit</p>
                            </div>
                            <div className="absolute bottom-4 right-6 flex gap-2 print:hidden">
                                {onEdit && (
                                    <button
                                        onClick={onEdit}
                                        className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white text-xs font-medium"
                                    >
                                        Modifier
                                    </button>
                                )}
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white text-xs font-medium"
                                >
                                    Imprimer
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white text-xs font-medium"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    {product.imageUrl ? (
                                        <div className="relative">
                                            <div
                                                className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer"
                                                onClick={() => setIsZoomed(true)}
                                            >
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-64 object-contain p-3"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setIsZoomed(true)}
                                                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
                                                style={{ color: COLORS.primary }}
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl h-64 flex flex-col items-center justify-center">
                                            <Package className="w-16 h-16" style={{ color: COLORS.primary, opacity: 0.2 }} />
                                            <p className="text-sm mt-2" style={{ color: COLORS.primary, opacity: 0.4 }}>Aucune image disponible</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Tag className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                {product.categoryDisplayName || product.category}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div
                                            className="px-3 py-1 rounded-full text-sm font-medium"
                                            style={{ backgroundColor: stockStatus.bgColor, color: stockStatus.color }}
                                        >
                                            {stockStatus.text}
                                        </div>
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                                            style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            {product.unit}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <span className="text-3xl font-bold" style={{ color: COLORS.warning }}>
                                            {product.price.toLocaleString()} Ar
                                        </span>
                                        <span className="text-xs ml-1" style={{ color: COLORS.text, opacity: 0.5 }}>TTC</span>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center py-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                                    <ShoppingCart className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                                </div>
                                                <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Stock actuel</span>
                                            </div>
                                            <span className="text-base font-semibold" style={{ color: COLORS.primary }}>
                                                {product.stockQuantity} {product.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: COLORS.warning }} />
                                                </div>
                                                <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Seuil d'alerte</span>
                                            </div>
                                            <span className="text-base font-semibold" style={{ color: COLORS.warning }}>
                                                {product.minimumStock} {product.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                                    <Calendar className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                                </div>
                                                <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Date d'ajout</span>
                                            </div>
                                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                                {new Date(product.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.6 }}>Niveau de stock</span>
                                            <span className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                                                {Math.round(stockPercentage)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.primary }}>Description</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm leading-relaxed" style={{ color: COLORS.text, opacity: 0.7 }}>
                                        {product.description || 'Aucune description disponible pour ce produit.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isZoomed && product.imageUrl && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={() => setIsZoomed(false)}
                    />
                    <div className="relative max-w-5xl w-full">
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="relative overflow-hidden rounded-xl bg-black/50 flex items-center justify-center" style={{ minHeight: '60vh', maxHeight: '80vh' }}>
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-auto h-auto max-w-full max-h-[75vh] object-contain"
                            />
                        </div>
                        <p className="text-center text-white/60 text-sm mt-4">Cliquez en dehors pour fermer</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetail;