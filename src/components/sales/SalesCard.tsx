import React, { useEffect, useState, useCallback } from 'react';
import { Edit, Trash2, Eye, X, User, MapPin, Package, DollarSign } from 'lucide-react';
import saleService from '../../services/saleService';
import type { Sale, SalesFilter } from '../../types/sales';
import SaleForm from './SaleForm';
import SaleDetail from './SaleDetail';
import { useAuth } from '../../contexts/AuthContext';

interface SalesListProps {
    externalSearch?: string;
    externalShowFilters?: boolean;
    onTotalCountChange?: (count: number) => void;
    onRefresh?: () => void;
    onFilterCountChange?: (count: number) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    danger: '#DC3545',
    success: '#28A745',
    background: '#F5F7FA',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

// Skeleton Card
const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} />
        <div className="relative flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
        </div>
        <div className="p-4 pt-6">
            <div className="text-center mb-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="flex gap-2 pt-2">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);

// Empty State
const EmptyState: React.FC<{ onAdd?: () => void; searchTerm?: string; hasFilters?: boolean; onClearFilters?: () => void }> =
    ({ onAdd, searchTerm, hasFilters, onClearFilters }) => {
        if (searchTerm) {
            return (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} />
                    <div className="relative flex justify-center -mt-12">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                            <svg className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="p-6 pt-6 text-center">
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun résultat trouvé</h3>
                        <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                            Aucune vente ne correspond à "{searchTerm}"
                        </p>
                        <button onClick={onClearFilters} className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                            Effacer la recherche
                        </button>
                    </div>
                </div>
            );
        }
        if (hasFilters) {
            return (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} />
                    <div className="relative flex justify-center -mt-12">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                            <svg className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v4m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v4m0-6V4" />
                            </svg>
                        </div>
                    </div>
                    <div className="p-6 pt-6 text-center">
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucun résultat trouvé</h3>
                        <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                            Aucune vente ne correspond aux filtres sélectionnés
                        </p>
                        <button onClick={onClearFilters} className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm font-medium"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} />
                <div className="relative flex justify-center -mt-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                        <svg className="w-10 h-10" style={{ color: COLORS.primary, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                        </svg>
                    </div>
                </div>
                <div className="p-6 pt-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>Aucune vente</h3>
                    <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Aucune vente n'est actuellement enregistrée
                    </p>
                    {onAdd && (
                        <button onClick={onAdd} className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 flex items-center gap-2 mx-auto text-sm font-medium"
                            style={{ backgroundColor: COLORS.primary }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvelle vente
                        </button>
                    )}
                </div>
            </div>
        );
    };

// Composant SaleCard
const SaleCard: React.FC<{
    sale: Sale;
    onView: (sale: Sale) => void;
    onEdit: (sale: Sale) => void;
    onDelete: (id: string) => void;
    canModify: boolean
}> = ({ sale, onView, onEdit, onDelete, canModify }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Ne pas ouvrir le détail si on clique sur un bouton d'action
        const target = e.target as HTMLElement;
        if (target.closest('.action-button')) {
            return;
        }
        onView(sale);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            {/* Header avec dégradé */}
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{ backgroundColor: 'rgba(255, 193, 7, 0.2)', color: COLORS.accent }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLORS.accent }} />
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>

            {/* Avatar / Image produit - cliquable */}
            <div className="relative flex justify-center -mt-12 cursor-pointer" onClick={(e) => { e.stopPropagation(); onView(sale); }}>
                <div className="relative">
                    {sale.product?.imageUrl && !imageError ? (
                        <img
                            src={sale.product.imageUrl}
                            alt={sale.product.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white hover:opacity-90 transition-opacity"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: COLORS.primary }}>
                            {sale.product?.name ? getInitials(sale.product.name) : 'V'}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.accent }}>
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {sale.product?.name || 'Produit'}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {sale.product?.categoryDisplayName || sale.product?.category || 'Catégorie'}
                    </p>
                </div>

                {/* Infos vente */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Vendeur</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {sale.user?.name || '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Région</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {sale.region?.name || '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ backgroundColor: COLORS.borderLight }}>
                        <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            <span style={{ color: COLORS.primary, opacity: 0.6 }}>Quantité</span>
                        </div>
                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                            {sale.quantity} x {sale.unitPrice.toLocaleString()} Ar
                        </span>
                    </div>
                </div>

                {/* Total */}
                <div className="mb-4 p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <p className="text-xs" style={{ color: COLORS.accent, opacity: 0.7 }}>Total TTC</p>
                    <p className="text-xl font-bold" style={{ color: COLORS.accent }}>
                        {sale.totalPrice.toLocaleString()} Ar
                    </p>
                </div>

                {/* Bouton Détails */}
                <button
                    onClick={(e) => { e.stopPropagation(); onView(sale); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium mb-2 action-button"
                    style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 60, 94, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                </button>

                {/* Actions (Modifier/Supprimer) */}
                {canModify && (
                    <div className="flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(sale); }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium action-button"
                            style={{ backgroundColor: COLORS.borderLight, color: COLORS.accent }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                        >
                            <Edit className="w-4 h-4" />
                            Modifier
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(sale.id); }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium action-button"
                            style={{ backgroundColor: COLORS.borderLight, color: COLORS.danger }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.borderLight}
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SalesList: React.FC<SalesListProps> = ({
    externalSearch,
    externalShowFilters,
    onTotalCountChange,
    onRefresh,
    onFilterCountChange
}) => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [searchTerm, setSearchTerm] = useState(externalSearch || '');
    const [showFilters, setShowFilters] = useState(externalShowFilters || false);
    const [filters, setFilters] = useState<SalesFilter>({});
    const [products, setProducts] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const userRole = user?.role || (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').role; } catch { return null; }
    })();

    const canModify = userRole === 'ADMIN' || userRole === 'MANAGER';

    useEffect(() => {
        if (externalSearch !== undefined) setSearchTerm(externalSearch);
    }, [externalSearch]);

    useEffect(() => {
        if (externalShowFilters !== undefined) setShowFilters(externalShowFilters);
    }, [externalShowFilters]);

    useEffect(() => {
        let count = 0;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        if (filters.productId) count++;
        if (filters.regionId) count++;
        if (filters.userId) count++;
        if (filters.minAmount) count++;
        if (filters.maxAmount) count++;
        onFilterCountChange?.(count);
    }, [filters, onFilterCountChange]);

    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [productsRes, regionsRes, usersRes] = await Promise.all([
                    saleService.getProducts(),
                    saleService.getRegions(),
                    saleService.getUsers()
                ]);
                setProducts(productsRes);
                setRegions(regionsRes);
                setUsers(usersRes);
            } catch (error) {
                console.error('Error loading filter data:', error);
            }
        };
        loadFilterData();
    }, []);

    const loadSales = useCallback(async () => {
        try {
            setLoading(true);
            const filterParams: SalesFilter = { ...filters };
            if (searchTerm && searchTerm.trim()) {
                filterParams.searchTerm = searchTerm.trim();
            }
            const response = await saleService.getSalesWithFilters(filterParams, page, 12);
            setSales(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            onTotalCountChange?.(response.totalElements || 0);
        } catch (error) {
            console.error('Error loading sales:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters, searchTerm, onTotalCountChange]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    useEffect(() => {
        const handleOpenForm = () => setShowForm(true);
        const handleSearch = (e: CustomEvent) => {
            setSearchTerm(e.detail);
            setPage(0);
        };
        const handleRefresh = () => {
            loadSales();
            onRefresh?.();
        };

        window.addEventListener('openSaleForm', handleOpenForm);
        window.addEventListener('searchSales', handleSearch as EventListener);
        window.addEventListener('refreshSales', handleRefresh);

        return () => {
            window.removeEventListener('openSaleForm', handleOpenForm);
            window.removeEventListener('searchSales', handleSearch as EventListener);
            window.removeEventListener('refreshSales', handleRefresh);
        };
    }, [loadSales, onRefresh]);

    const handleDelete = async (id: string) => {
        if (!canModify) {
            alert('Vous n\'avez pas les droits pour supprimer une vente');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
            try {
                await saleService.deleteSale(id);
                loadSales();
                onRefresh?.();
            } catch (error) {
                console.error('Error deleting sale:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetFilters = () => {
        setFilters({});
        setSearchTerm('');
        setPage(0);
    };

    const hasActiveFilters = () => {
        return !!(filters.startDate || filters.endDate || filters.productId ||
            filters.regionId || filters.userId || filters.minAmount || filters.maxAmount);
    };

    if (loading && sales.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Panneau des filtres */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-md p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Date début</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                value={filters.startDate || ''}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Date fin</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                value={filters.endDate || ''}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Produit</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, productId: e.target.value || undefined })}
                                value={filters.productId || ''}
                            >
                                <option value="">Tous les produits</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Région</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, regionId: e.target.value || undefined })}
                                value={filters.regionId || ''}
                            >
                                <option value="">Toutes les régions</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Vendeur</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
                                value={filters.userId || ''}
                            >
                                <option value="">Tous les vendeurs</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Montant min (Ar)</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, minAmount: parseFloat(e.target.value) || undefined })}
                                value={filters.minAmount || ''}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Montant max (Ar)</label>
                            <input
                                type="number"
                                placeholder="Illimité"
                                className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                                style={{ borderColor: COLORS.border }}
                                onChange={(e) => setFilters({ ...filters, maxAmount: parseFloat(e.target.value) || undefined })}
                                value={filters.maxAmount || ''}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                <X className="w-4 h-4" />
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Résultat de recherche */}
            {searchTerm && !loading && sales.length > 0 && (
                <div className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    {totalElements} résultat{totalElements > 1 ? 's' : ''} pour "{searchTerm}"
                </div>
            )}

            {/* Grille des cartes */}
            {sales.length === 0 && !loading ? (
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <EmptyState
                            searchTerm={searchTerm}
                            hasFilters={hasActiveFilters()}
                            onClearFilters={resetFilters}
                            onAdd={() => window.dispatchEvent(new CustomEvent('openSaleForm'))}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sales.map((sale) => (
                            <SaleCard
                                key={sale.id}
                                sale={sale}
                                onView={(s) => { setSelectedSale(s); setShowDetail(true); }}
                                onEdit={(s) => { setSelectedSale(s); setShowForm(true); }}
                                onDelete={handleDelete}
                                canModify={canModify}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                ◀ Précédent
                            </button>
                            <span className="px-4 py-2 text-sm" style={{ color: COLORS.primary }}>
                                Page {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page === totalPages - 1}
                                className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Suivant ▶
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modales */}
            {showForm && (
                <SaleForm
                    isOpen={showForm}
                    onClose={() => { setShowForm(false); setSelectedSale(null); }}
                    onSuccess={() => { loadSales(); onRefresh?.(); }}
                    editSale={selectedSale || undefined}
                />
            )}

            {showDetail && selectedSale && (
                <SaleDetail
                    isOpen={showDetail}
                    onClose={() => { setShowDetail(false); setSelectedSale(null); }}
                    sale={selectedSale}
                />
            )}
        </div>
    );
};

export default SalesList;