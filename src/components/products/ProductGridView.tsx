import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Package, Search, Plus, FilterX } from 'lucide-react';
import productService from '../../services/productService';
import type { Product, ProductFilters } from '../../types/product';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';

interface ProductGridViewProps {
    externalSearch?: string;
    externalShowFilters?: boolean;
    externalFilters?: {
        category: string;
        minPrice: string;
        maxPrice: string;
        lowStock: boolean;
    };
    onTotalCountChange?: (count: number) => void;
    onRefresh?: () => void;
    onFilterCountChange?: (count: number) => void;
    onFilterChange?: (filters: any) => void;
    externalShowForm?: boolean;
    onCloseForm?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    background: '#F5F7FA',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-7 bg-gray-200 rounded w-1/3"></div>
    </div>
);

const EmptyState: React.FC<{
    onAdd?: () => void;
    searchTerm?: string;
    hasFilters?: boolean;
    onClearFilters?: () => void;
}> = ({ onAdd, searchTerm, hasFilters, onClearFilters }) => {
    if (searchTerm) {
        return (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
                <div className="relative flex justify-center -mt-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                        <Search className="w-10 h-10" style={{ color: COLORS.warning, opacity: 0.5 }} />
                    </div>
                </div>
                <div className="p-6 pt-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun résultat trouvé</h3>
                    <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Aucun produit ne correspond à "{searchTerm}"
                    </p>
                    <button onClick={onClearFilters}
                        className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium mx-auto block items-center gap-2"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                        <FilterX className="w-4 h-4" />
                        Effacer les filtres
                    </button>
                </div>
            </div>
        );
    }

    if (hasFilters) {
        return (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
                <div className="relative flex justify-center -mt-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                        <FilterX className="w-10 h-10" style={{ color: COLORS.warning, opacity: 0.5 }} />
                    </div>
                </div>
                <div className="p-6 pt-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun résultat trouvé</h3>
                    <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Aucun produit ne correspond aux filtres sélectionnés
                    </p>
                    <button onClick={onClearFilters}
                        className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium mx-auto block items-center gap-2"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                        <FilterX className="w-4 h-4" />
                        Effacer les filtres
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
            <div className="relative flex justify-center -mt-12">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                    <Package className="w-10 h-10" style={{ color: COLORS.primary, opacity: 0.3 }} />
                </div>
            </div>
            <div className="p-6 pt-6 text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun produit</h3>
                <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    Aucun produit n'est actuellement enregistré
                </p>
                {onAdd && (
                    <button onClick={onAdd}
                        className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 flex items-center gap-2 mx-auto text-sm font-medium"
                        style={{ backgroundColor: COLORS.primary }}>
                        <Plus className="w-4 h-4" />
                        Ajouter un produit
                    </button>
                )}
            </div>
        </div>
    );
};

const ProductGridView: React.FC<ProductGridViewProps> = ({
    externalSearch,
    externalShowFilters,
    externalFilters,
    onTotalCountChange,
    onRefresh,
    onFilterCountChange,
    onFilterChange,
    externalShowForm,
    onCloseForm
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showFilters, setShowFilters] = useState(externalShowFilters || false);
    const [localFilters, setLocalFilters] = useState({
        category: externalFilters?.category || '',
        minPrice: externalFilters?.minPrice || '',
        maxPrice: externalFilters?.maxPrice || '',
        lowStock: externalFilters?.lowStock || false,
    });

    // État local pour la recherche et les filtres, synchronisés avec les props
    const [currentSearch, setCurrentSearch] = useState(externalSearch || '');
    const [currentFilters, setCurrentFilters] = useState(localFilters);

    const isLoadingRef = useRef(false);
    const initialLoadDone = useRef(false);
    const lastRequestRef = useRef<string>('');

    // Synchronisation avec les props externes
    useEffect(() => {
        if (externalSearch !== undefined && externalSearch !== currentSearch) {
            setCurrentSearch(externalSearch);
            setPage(0); // Reset page quand la recherche change
        }
    }, [externalSearch]);

    useEffect(() => {
        if (externalShowFilters !== undefined) setShowFilters(externalShowFilters);
    }, [externalShowFilters]);

    useEffect(() => {
        if (externalFilters) {
            const newFilters = {
                category: externalFilters.category || '',
                minPrice: externalFilters.minPrice || '',
                maxPrice: externalFilters.maxPrice || '',
                lowStock: externalFilters.lowStock || false,
            };
            setCurrentFilters(newFilters);
            setLocalFilters(newFilters);
            setPage(0);
        }
    }, [externalFilters]);

    // Mise à jour du compteur de filtres
    useEffect(() => {
        let count = 0;
        if (currentFilters.category) count++;
        if (currentFilters.minPrice) count++;
        if (currentFilters.maxPrice) count++;
        if (currentFilters.lowStock) count++;
        onFilterCountChange?.(count);
    }, [currentFilters, onFilterCountChange]);

    // Fonction de chargement
    const loadProducts = useCallback(async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        const requestKey = JSON.stringify({ page, search: currentSearch, filters: currentFilters });
        if (lastRequestRef.current === requestKey) {
            isLoadingRef.current = false;
            setLoading(false);
            return;
        }
        lastRequestRef.current = requestKey;

        try {
            const filterParams: ProductFilters = {};
            if (currentSearch?.trim()) filterParams.search = currentSearch.trim();
            if (currentFilters.category) filterParams.category = currentFilters.category;
            if (currentFilters.minPrice) filterParams.minPrice = parseFloat(currentFilters.minPrice);
            if (currentFilters.maxPrice) filterParams.maxPrice = parseFloat(currentFilters.maxPrice);
            if (currentFilters.lowStock) filterParams.lowStock = true;

            const response = await productService.getProductsWithFilters(filterParams, page, 12);
            if (response?.content !== undefined) {
                setProducts(response.content);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
                onTotalCountChange?.(response.totalElements || 0);
            } else {
                setProducts([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Impossible de charger les produits');
            setProducts([]);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [page, currentSearch, currentFilters, onTotalCountChange]);

    // Chargement initial
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadProducts();
        }
    }, [loadProducts]);

    // Rechargement quand la page, la recherche ou les filtres changent
    useEffect(() => {
        if (initialLoadDone.current) {
            loadProducts();
        }
    }, [page, currentSearch, currentFilters, loadProducts]);

    // Gestion du formulaire externe
    useEffect(() => {
        const handleOpenForm = () => { setSelectedProduct(null); setShowForm(true); };
        window.addEventListener('openProductForm', handleOpenForm);
        return () => window.removeEventListener('openProductForm', handleOpenForm);
    }, []);

    useEffect(() => {
        if (externalShowForm !== undefined) setShowForm(externalShowForm);
    }, [externalShowForm]);

    // Gestion CRUD
    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await productService.deleteProduct(id);
                loadProducts();
                onRefresh?.();
            } catch {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleCloseFormLocal = () => {
        setShowForm(false);
        setSelectedProduct(null);
        loadProducts();
        onRefresh?.();
        onCloseForm?.();
    };

    const handleLocalFilterChange = (key: string, value: any) => {
        const updated = { ...currentFilters, [key]: value };
        setCurrentFilters(updated);
        setLocalFilters(updated);
        onFilterChange?.(updated);
        setPage(0);
    };

    const resetFilters = () => {
        const empty = { category: '', minPrice: '', maxPrice: '', lowStock: false };
        setCurrentFilters(empty);
        setLocalFilters(empty);
        setCurrentSearch('');
        onFilterChange?.(empty);
        setPage(0);
        // Notifier le parent pour qu'il mette à jour searchTerm
        window.dispatchEvent(new CustomEvent('resetProductsFilters'));
    };

    const hasActiveFilters = () => {
        return !!(currentFilters.category ||
            currentFilters.minPrice ||
            currentFilters.maxPrice ||
            currentFilters.lowStock);
    };

    // États d'affichage
    if (loading && products.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="text-center py-12">
                <Package className="w-20 h-20 mx-auto mb-4" style={{ color: COLORS.primary, opacity: 0.2 }} />
                <p className="text-lg mb-2" style={{ color: COLORS.primary, opacity: 0.5 }}>{error}</p>
                <button onClick={() => loadProducts()}
                    className="mt-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                    style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                    Réessayer
                </button>
            </div>
        );
    }

    if (products.length === 0 && !loading) {
        const hasSearch = currentSearch && currentSearch.trim() !== '';
        const hasFilters = hasActiveFilters();

        if (hasSearch || hasFilters) {
            return (
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <EmptyState
                            searchTerm={hasSearch ? currentSearch : undefined}
                            hasFilters={hasFilters}
                            onClearFilters={resetFilters}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <EmptyState onAdd={() => {
                        window.dispatchEvent(new CustomEvent('openProductForm'));
                    }} />
                </div>
            </div>
        );
    }

    return (
        <>
            {showFilters && (
                <div className="mb-6 p-4 rounded-xl border bg-white" style={{ borderColor: COLORS.border }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Catégorie</label>
                            <select className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                                value={currentFilters.category}>
                                <option value="">Toutes les catégories</option>
                                <option value="CONSTRUCTION">Construction</option>
                                <option value="ELECTRICITY">Électricité</option>
                                <option value="PLUMBING">Plomberie</option>
                                <option value="TOOLS">Outillage</option>
                                <option value="INDUSTRIAL">Industriel</option>
                                <option value="AGRICULTURAL">Agricole</option>
                                <option value="SPARE_PARTS">Pièces détachées</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Prix minimum (Ar)</label>
                            <input type="number" placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)}
                                value={currentFilters.minPrice} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Prix maximum (Ar)</label>
                            <input type="number" placeholder="Illimité"
                                className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)}
                                value={currentFilters.maxPrice} />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 pb-2">
                                <input type="checkbox" checked={currentFilters.lowStock}
                                    onChange={(e) => handleLocalFilterChange('lowStock', e.target.checked)}
                                    className="w-4 h-4 rounded" style={{ accentColor: COLORS.warning }} />
                                <span className="text-sm" style={{ color: COLORS.primary }}>Stock faible uniquement</span>
                            </label>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={resetFilters}
                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-sm"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>
            )}

            {currentSearch && !loading && products.length > 0 && (
                <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    {totalElements} résultat{totalElements > 1 ? 's' : ''} pour "{currentSearch}"
                </div>
            )}

            {loading && products.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Mise à jour...
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onView={(p) => { setSelectedProduct(p); setShowDetail(true); }}
                        onEdit={(p) => { setSelectedProduct(p); setShowForm(true); }}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                    <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                        className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}>◀ Précédent</button>
                    <span className="px-4 py-2 text-sm" style={{ color: COLORS.primary }}>
                        Page {page + 1} / {totalPages}
                    </span>
                    <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                        className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}>Suivant ▶</button>
                </div>
            )}

            {showForm && (
                <ProductForm isOpen={showForm} onClose={handleCloseFormLocal}
                    onSuccess={handleCloseFormLocal} editProduct={selectedProduct || undefined} />
            )}

            {showDetail && selectedProduct && (
                <ProductDetail isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedProduct(null); }}
                    product={selectedProduct}
                    onEdit={() => { setShowDetail(false); setShowForm(true); }} />
            )}
        </>
    );
};

export default ProductGridView;