import React, { useEffect, useState } from 'react';
import { X, AlertCircle, ShoppingCart, Search, CreditCard, Building2 } from 'lucide-react';
import saleService from '../../services/saleService';
import type { Client } from '../../types/client.types';

interface SaleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editSale?: any;
    preselectedClientId?: string;
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

const SaleForm: React.FC<SaleFormProps> = ({ isOpen, onClose, onSuccess, editSale, preselectedClientId }) => {
    const [userId, setUserId] = useState('');
    const [regionId, setRegionId] = useState('');
    const [productId, setProductId] = useState('');
    const [clientId, setClientId] = useState(preselectedClientId || '');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadFormData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (preselectedClientId) {
            setClientId(preselectedClientId);
        }
    }, [preselectedClientId]);

    useEffect(() => {
        if (editSale && isOpen) {
            setUserId(editSale.user?.id || '');
            setRegionId(editSale.region?.id || '');
            setProductId(editSale.product?.id || '');
            if (editSale.product) {
                setProductSearch(editSale.product.name || '');
            }
            setClientId(editSale.client?.id || preselectedClientId || '');
            setQuantity(editSale.quantity || 1);
            setUnitPrice(editSale.unitPrice || 0);
            if (editSale.date) {
                const date = new Date(editSale.date);
                setSelectedDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            }
        } else if (!editSale && preselectedClientId) {
            resetForm();
        }
    }, [editSale, isOpen, preselectedClientId]);

    const resetForm = () => {
        if (!preselectedClientId) {
            setClientId('');
        }
        setUserId('');
        setRegionId('');
        setProductId('');
        setProductSearch('');
        setQuantity(1);
        setUnitPrice(0);
        setError(null);
        const now = new Date();
        setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    };

    const loadFormData = async () => {
        setLoadingData(true);
        try {
            const [productsData, regionsData, usersData, clientsData] = await Promise.all([
                saleService.getProducts(),
                saleService.getRegions(),
                saleService.getUsers(),
                saleService.getClients()
            ]);
            console.log('Products loaded:', productsData);
            setProducts(productsData || []);
            setRegions(regionsData || []);
            setUsers(usersData || []);
            setClients(clientsData || []);
        } catch (error) {
            console.error('Error loading form data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase())
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

            const saleRequest: any = {
                userId: userId,
                regionId: regionId,
                productId: productId,
                quantity: quantity,
                unitPrice: unitPrice,
                date: dateTime
            };

            if (clientId) {
                saleRequest.clientId = clientId;
            }

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
                <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }} onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-5 pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <ShoppingCart className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">
                                            {editSale ? 'Modifier la vente' : 'Nouvelle vente'}
                                        </h2>
                                        <p className="text-white/60 text-xs">
                                            {editSale ? 'Modifier une transaction' : 'Créer une transaction'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center">
                                    <X className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {error && (
                            <div className="p-3 rounded-xl flex items-center gap-2 text-sm" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#DC3545' }}>
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {loadingData ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
                            </div>
                        ) : (
                            <>
                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>

                                {/* Vendeur */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Vendeur <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white appearance-none"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    >
                                        <option value="">Sélectionner un vendeur</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Région */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Région <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={regionId}
                                        onChange={(e) => setRegionId(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white appearance-none"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    >
                                        <option value="">Sélectionner une région</option>
                                        {regions.map(region => (
                                            <option key={region.id} value={region.id}>{region.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Client (optionnel) */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Client (optionnel)
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <select
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white appearance-none"
                                            style={{ borderColor: COLORS.border }}
                                            onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                            onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                            disabled={!!preselectedClientId}
                                        >
                                            <option value="">Aucun client</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.companyName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Produit avec recherche */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Produit <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher un produit..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                            style={{ borderColor: COLORS.border }}
                                            onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                            onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                        />
                                    </div>

                                    {productSearch && filteredProducts.length === 0 && !productId && (
                                        <div className="mt-2 p-3 text-center text-sm rounded-xl" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary, opacity: 0.6 }}>
                                            Aucun produit trouvé
                                        </div>
                                    )}

                                    {productSearch && filteredProducts.length > 0 && !productId && (
                                        <div className="mt-2 border rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg z-10" style={{ borderColor: COLORS.border }}>
                                            {filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="p-3 cursor-pointer hover:bg-gray-50 border-b transition-colors"
                                                    style={{ borderColor: COLORS.border }}
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{product.name}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                        Stock: {product.stockQuantity !== undefined ? product.stockQuantity : 'N/A'} - {product.price?.toLocaleString() || 0} Ar
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedProduct && (
                                        <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{selectedProduct.name}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                        Stock: {selectedProduct.stockQuantity !== undefined ? selectedProduct.stockQuantity : 'N/A'}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold" style={{ color: COLORS.accent }}>
                                                    {selectedProduct.price?.toLocaleString() || 0} Ar
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductId('');
                                                    setProductSearch('');
                                                    setUnitPrice(0);
                                                }}
                                                className="mt-2 text-xs hover:underline"
                                                style={{ color: COLORS.danger }}
                                            >
                                                Changer de produit
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Quantité */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Quantité <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 rounded-full flex items-center justify-center border hover:bg-gray-50 transition-colors"
                                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-20 px-3 py-2 border rounded-xl text-sm text-center focus:outline-none focus:ring-2 transition-all bg-white"
                                            style={{ borderColor: COLORS.border }}
                                            onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                            onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center border hover:bg-gray-50 transition-colors"
                                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                        >
                                            +
                                        </button>
                                        {selectedProduct && selectedProduct.stockQuantity !== undefined && (
                                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                Max: {selectedProduct.stockQuantity}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Prix unitaire */}
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Prix unitaire (Ar)
                                    </label>
                                    <input
                                        type="number"
                                        value={unitPrice}
                                        onChange={(e) => !productId && setUnitPrice(parseFloat(e.target.value) || 0)}
                                        readOnly={!!productId}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50"
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
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition-all"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || loadingData || !productId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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