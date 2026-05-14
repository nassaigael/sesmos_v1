// components/products/ProductStock.tsx
import React, { useState } from 'react';
import { X, Save, Minus, Plus, AlertTriangle } from 'lucide-react';
import productService from '../../services/productService';
import type { Product } from '../../types/product';

interface ProductStockProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onUpdate: () => void;
}

const ProductStock: React.FC<ProductStockProps> = ({ isOpen, onClose, product, onUpdate }) => {
    const [quantity, setQuantity] = useState(product.stockQuantity);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 0) {
            setQuantity(newQuantity);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            await productService.updateStock(product.id, quantity);
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du stock');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isLowStock = quantity <= product.minimumStock;
    const stockValue = quantity * product.price;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                            Gestion du stock
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>{product.categoryDisplayName}</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--color-danger)' }}>
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {isLowStock && quantity > 0 && (
                            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: 'var(--color-warning)' }}>
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">Stock faible ! Seuil minimum: {product.minimumStock} {product.unit}</span>
                            </div>
                        )}

                        {quantity === 0 && (
                            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--color-danger)' }}>
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">Rupture de stock !</span>
                            </div>
                        )}

                        {/* Quantity selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                Quantité en stock ({product.unit})
                            </label>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: 'var(--color-border)' }}
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-32 text-center px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                                    style={{ borderColor: 'var(--color-border)' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: 'var(--color-border)' }}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 rounded-lg mb-6" style={{ backgroundColor: 'rgba(26, 60, 94, 0.05)' }}>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Valeur du stock:</span>
                                <span className="font-semibold">{stockValue.toLocaleString()} Ar</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Seuil d'alerte:</span>
                                <span>{product.minimumStock} {product.unit}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductStock;