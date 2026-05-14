import React, { useEffect, useState } from 'react';
import { X, AlertCircle, ShoppingCart, Search, CreditCard } from 'lucide-react';
import saleService from '../../services/saleService';

interface SaleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editSale?: any;
}

interface Product {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    danger: '#DC3545',
    success: '#28A745',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const SaleForm: React.FC<SaleFormProps> = ({ isOpen, onClose, onSuccess, editSale }) => {
    const [userId, setUserId] = useState('');
    const [regionId, setRegionId] = useState('');
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadFormData();
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        if (editSale && isOpen) {
            setUserId(editSale.user?.id || '');
            setRegionId(editSale.region?.id || '');
            setProductId(editSale.product?.id || '');
            setQuantity(editSale.quantity || 1);
            setUnitPrice(editSale.unitPrice || 0);
            if (editSale.date) {
                const date = new Date(editSale.date);
                setSelectedDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            }
        }
    }, [editSale, isOpen]);

    const resetForm = () => {
        setUserId('');
        setRegionId('');
        setProductId('');
        setQuantity(1);
        setUnitPrice(0);
        setProductSearch('');
        setError(null);
        const now = new Date();
        setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    };

    const loadFormData = async () => {
        try {
            const [productsData, regionsData, usersData] = await Promise.all([
                saleService.getProducts(),
                saleService.getRegions(),
                saleService.getUsers()
            ]);
            setProducts(productsData);
            setRegions(regionsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleProductSelect = (product: Product) => {
        setProductId(product.id);
        setUnitPrice(product.price);
        setProductSearch(product.name);
    };

    const getSelectedProduct = () => {
        return products.find(p => p.id === productId);
    };

    const getTotalAmount = () => {
        return quantity * unitPrice;
    };

    const handleSubmit = async () => {
        if (!userId) {
            setError('Veuillez sélectionner un vendeur');
            return;
        }
        if (!regionId) {
            setError('Veuillez sélectionner une région');
            return;
        }
        if (!productId) {
            setError('Veuillez sélectionner un produit');
            return;
        }
        if (quantity < 1) {
            setError('La quantité doit être au moins 1');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const dateTime = `${selectedDate}T00:00:00`;

            const saleRequest = {
                userId: userId,
                regionId: regionId,
                productId: productId,
                quantity: quantity,
                unitPrice: unitPrice,
                date: dateTime
            };

            if (editSale) {
                await saleService.updateSale(editSale.id, saleRequest);
            } else {
                await saleService.createSale(saleRequest);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating sale:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Erreur lors de l\'enregistrement';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedProduct = getSelectedProduct();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }} onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-4 pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <ShoppingCart className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-base">
                                            {editSale ? 'Modifier la vente' : 'Nouvelle vente'}
                                        </h2>
                                        <p className="text-white/60 text-xs">
                                            {editSale ? 'Modifier une transaction' : 'Créer une transaction'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                                    <X className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {error && (
                            <div className="p-2 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#DC3545' }}>
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                style={{ borderColor: COLORS.border }}
                            />
                        </div>

                        {/* Vendeur */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Vendeur <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                style={{ borderColor: COLORS.border }}
                            >
                                <option value="">Sélectionner un vendeur</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Région */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Région <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={regionId}
                                onChange={(e) => setRegionId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                style={{ borderColor: COLORS.border }}
                            >
                                <option value="">Sélectionner une région</option>
                                {regions.map(region => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Produit */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Produit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white"
                                    style={{ borderColor: COLORS.border }}
                                />
                            </div>

                            {productSearch && filteredProducts.length > 0 && !productId && (
                                <div className="mt-1 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg z-10">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            className="p-2 cursor-pointer hover:bg-gray-50 border-b"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                Stock: {product.stockQuantity} - {product.price.toLocaleString()} Ar
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedProduct && (
                                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">{selectedProduct.name}</p>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                Stock: {selectedProduct.stockQuantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: COLORS.accent }}>
                                            {selectedProduct.price.toLocaleString()} Ar
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProductId('');
                                            setProductSearch('');
                                            setUnitPrice(0);
                                        }}
                                        className="mt-1 text-xs text-red-500"
                                    >
                                        Changer
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quantité */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Quantité <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                                    style={{ borderColor: COLORS.border }}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 px-3 py-2 border rounded-lg text-sm text-center bg-white"
                                    style={{ borderColor: COLORS.border }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                                    style={{ borderColor: COLORS.border }}
                                >
                                    +
                                </button>
                                {selectedProduct && (
                                    <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                        Max: {selectedProduct.stockQuantity}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Prix unitaire (lecture seule si produit sélectionné) */}
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                                Prix unitaire (Ar)
                            </label>
                            <input
                                type="number"
                                value={unitPrice}
                                onChange={(e) => !productId && setUnitPrice(parseFloat(e.target.value) || 0)}
                                readOnly={!!productId}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50"
                                style={{ borderColor: COLORS.border }}
                            />
                        </div>

                        {/* Total */}
                        <div className="pt-2 border-t" style={{ borderColor: COLORS.border }}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm" style={{ color: COLORS.primary }}>Total TTC:</span>
                                <span className="text-xl font-bold" style={{ color: COLORS.accent }}>
                                    {getTotalAmount().toLocaleString()} Ar
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !productId}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        {editSale ? 'Modifier' : 'Valider'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleForm;