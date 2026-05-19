import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { Package, AlertTriangle, TrendingDown, Plus, Minus, Search, FilterX } from 'lucide-react';
import stockApi from '../api/Stockapi';
import type { Stock } from '../types/Stock.types';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    accentLight: '#FFD54F',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA',
    white: '#FFFFFF'
};

const STATUS_CONFIG = {
    normal: { label: 'Normal', color: COLORS.primary, bgColor: `${COLORS.primary}10` },
    critical: { label: 'Critique', color: COLORS.accent, bgColor: `${COLORS.accent}15` },
    out: { label: 'Rupture', color: COLORS.accentLight, bgColor: `${COLORS.accent}10` }
};

const SkeletonRow: React.FC = () => (
    <div className="border-t animate-pulse" style={{ borderColor: COLORS.border }}>
        <div className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-200" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC<{ searchTerm: string; onClear: () => void }> = ({ searchTerm, onClear }) => (
    <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
            {searchTerm ? (
                <Search className="w-8 h-8" style={{ color: COLORS.accent, opacity: 0.6 }} />
            ) : (
                <Package className="w-8 h-8" style={{ color: COLORS.primary, opacity: 0.3 }} />
            )}
        </div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: COLORS.primary }}>
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucun stock'}
        </h3>
        <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
            {searchTerm
                ? `Aucun produit ne correspond à "${searchTerm}"`
                : 'Aucun stock n\'est actuellement enregistré'}
        </p>
        {searchTerm && (
            <button
                onClick={onClear}
                className="mt-4 px-4 py-2 rounded-lg border flex items-center gap-2 mx-auto text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.primary }}
            >
                <FilterX className="w-4 h-4" />
                Effacer la recherche
            </button>
        )}
    </div>
);

const Stock: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'critical' | 'out'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustModal, setAdjustModal] = useState<{ stock: Stock; mode: 'add' | 'remove' } | null>(null);
    const [adjustQty, setAdjustQty] = useState(1);
    const [adjusting, setAdjusting] = useState(false);

    const loadStocks = useCallback(async () => {
        setLoading(true);
        try {
            let data: Stock[];
            if (filter === 'critical') data = await stockApi.getCritical();
            else if (filter === 'out') data = await stockApi.getOutOfStock();
            else data = await stockApi.getAll();
            setStocks(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { loadStocks(); }, [loadStocks]);

    const handleAdjust = async () => {
        if (!adjustModal) return;
        setAdjusting(true);
        try {
            if (adjustModal.mode === 'add') {
                await stockApi.addStock(adjustModal.stock.product.id, adjustQty);
            } else {
                await stockApi.removeStock(adjustModal.stock.product.id, adjustQty);
            }
            setAdjustModal(null);
            setAdjustQty(1);
            loadStocks();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de l\'ajustement du stock');
        } finally {
            setAdjusting(false);
        }
    };

    const filtered = stocks.filter(s =>
        s.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCount = stocks.length;
    const criticalCount = stocks.filter(s => s.isCritical).length;
    const outCount = stocks.filter(s => s.quantity <= 0).length;

    const getStatus = (stock: Stock) => {
        if (stock.quantity <= 0) return STATUS_CONFIG.out;
        if (stock.isCritical) return STATUS_CONFIG.critical;
        return STATUS_CONFIG.normal;
    };

    const handleFilterClick = (newFilter: 'all' | 'critical' | 'out') => {
        setFilter(newFilter);
        setSearchTerm('');
    };

    if (loading && stocks.length === 0) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
                <Header
                    toggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    currentPage="stock"
                    onSearch={setSearchTerm}
                    showSearch={true}
                    totalCount={0}
                />
                <div className="p-4 md:p-6">
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                        {[...Array(5)].map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="stock"
                onSearch={setSearchTerm}
                showSearch={true}
                totalCount={filtered.length}
            />

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => handleFilterClick('all')}
                        className={`bg-white rounded-2xl shadow-md p-5 transition-all hover:shadow-lg text-left ${filter === 'all' ? 'ring-2 ring-offset-2' : ''
                            }`}
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            ...(filter === 'all' && { ringColor: COLORS.accent })
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{totalCount}</p>
                                <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Total produits</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}15` }}>
                                <Package className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleFilterClick('critical')}
                        className={`bg-white rounded-2xl shadow-md p-5 transition-all hover:shadow-lg text-left ${filter === 'critical' ? 'ring-2 ring-offset-2' : ''
                            }`}
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            ...(filter === 'critical' && { ringColor: COLORS.accent })
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{criticalCount}</p>
                                <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Stock critique</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                <AlertTriangle className="w-6 h-6" style={{ color: COLORS.accent }} />
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleFilterClick('out')}
                        className={`bg-white rounded-2xl shadow-md p-5 transition-all hover:shadow-lg text-left ${filter === 'out' ? 'ring-2 ring-offset-2' : ''
                            }`}
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            ...(filter === 'out' && { ringColor: COLORS.accent })
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold" style={{ color: COLORS.accentLight }}>{outCount}</p>
                                <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Ruptures</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                <TrendingDown className="w-6 h-6" style={{ color: COLORS.accent }} />
                            </div>
                        </div>
                    </button>
                </div>

                {searchTerm && !loading && filtered.length > 0 && (
                    <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour "{searchTerm}"
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                                style={{ borderColor: COLORS.primary }} />
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Chargement...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState searchTerm={searchTerm} onClear={() => setSearchTerm('')} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: COLORS.borderLight }}>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Produit</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Catégorie</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Quantité</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Seuil</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Statut</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Mis à jour</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((stock, i) => {
                                        const status = getStatus(stock);
                                        return (
                                            <tr key={stock.id}
                                                className="border-t hover:bg-gray-50 transition-colors"
                                                style={{ borderColor: COLORS.border, backgroundColor: i % 2 === 0 ? 'white' : COLORS.borderLight }}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {stock.product?.imageUrl ? (
                                                            <img
                                                                src={stock.product.imageUrl}
                                                                alt={stock.product.name}
                                                                className="w-9 h-9 rounded-lg object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                                style={{ backgroundColor: `${COLORS.primary}10` }}>
                                                                <Package className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>
                                                            {stock.product?.name || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                                    {stock.product?.categoryDisplayName || stock.product?.category || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-bold" style={{ color: status.color }}>
                                                        {stock.quantity} {stock.product?.unit || ''}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                    {stock.threshold} {stock.product?.unit || ''}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: status.bgColor, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                    {new Date(stock.updatedAt).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => { setAdjustModal({ stock, mode: 'add' }); setAdjustQty(1); }}
                                                            className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                                                            style={{ color: COLORS.primary }}
                                                            title="Ajouter du stock"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setAdjustModal({ stock, mode: 'remove' }); setAdjustQty(1); }}
                                                            className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                                                            style={{ color: COLORS.primary }}
                                                            title="Retirer du stock"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {adjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }} onClick={() => setAdjustModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300">
                        <div className="relative h-20" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
                            <div className="absolute bottom-3 left-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        {adjustModal.mode === 'add' ? (
                                            <Plus className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                        ) : (
                                            <Minus className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-base">
                                            {adjustModal.mode === 'add' ? 'Ajouter du stock' : 'Retirer du stock'}
                                        </h2>
                                        <p className="text-white/60 text-xs">Ajuster la quantité</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setAdjustModal(null)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: COLORS.borderLight }}>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{adjustModal.stock.product?.name}</p>
                                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>
                                    {adjustModal.stock.quantity}
                                    <span className="text-sm font-normal ml-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                        {adjustModal.stock.product?.unit}
                                    </span>
                                </p>
                                <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Stock actuel</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Quantité à {adjustModal.mode === 'add' ? 'ajouter' : 'retirer'}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={e => e.target.style.borderColor = COLORS.accent}
                                    onBlur={e => e.target.style.borderColor = COLORS.border}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setAdjustModal(null)}
                                    className="flex-1 px-3 py-2 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAdjust}
                                    disabled={adjusting}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    {adjusting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        adjustModal.mode === 'add' ? 'Ajouter' : 'Retirer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;