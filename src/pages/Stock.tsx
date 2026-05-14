import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { Package, AlertTriangle, TrendingDown, RefreshCw, Plus, Minus } from 'lucide-react';
import stockApi from '../api/stockApi';
import type { Stock } from '../types/stock.types';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    success: '#28A745',
    border: 'rgba(26, 60, 94, 0.1)',
};

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

    const criticalCount = stocks.filter(s => s.isCritical).length;
    const outCount = stocks.filter(s => s.quantity <= 0).length;

    const getStatusColor = (s: Stock) => {
        if (s.quantity <= 0) return COLORS.danger;
        if (s.isCritical) return COLORS.warning;
        return COLORS.success;
    };

    const getStatusText = (s: Stock) => {
        if (s.quantity <= 0) return 'Rupture';
        if (s.isCritical) return 'Critique';
        return 'Normal';
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isMobile={isMobile}
                currentPage="stock" onSearch={setSearchTerm} showSearch={true}
                totalCount={filtered.length}
            />
            <div className="p-4 md:p-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total produits', value: stocks.length, icon: <Package className="w-6 h-6" />, color: COLORS.primary },
                        { label: 'Stock critique', value: criticalCount, icon: <AlertTriangle className="w-6 h-6" />, color: COLORS.warning },
                        { label: 'Ruptures', value: outCount, icon: <TrendingDown className="w-6 h-6" />, color: COLORS.danger },
                    ].map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4"
                            style={{ borderColor: COLORS.border }}>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>{kpi.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtres */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['all', 'critical', 'out'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                                backgroundColor: filter === f ? COLORS.primary : 'white',
                                color: filter === f ? 'white' : COLORS.primary,
                                border: `1px solid ${COLORS.border}`,
                            }}>
                            {f === 'all' ? 'Tous' : f === 'critical' ? '⚠ Critique' : '✕ Rupture'}
                        </button>
                    ))}
                    <button onClick={loadStocks}
                        className="ml-auto px-4 py-2 rounded-xl text-sm border flex items-center gap-2 hover:bg-gray-50 transition-all"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                        <RefreshCw className="w-4 h-4" /> Actualiser
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                                style={{ borderColor: COLORS.primary }} />
                            <p style={{ color: COLORS.primary, opacity: 0.5 }}>Chargement...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center">
                            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.primary, opacity: 0.2 }} />
                            <p style={{ color: COLORS.primary, opacity: 0.5 }}>Aucun stock trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: `${COLORS.primary}08` }}>
                                        {['Produit', 'Catégorie', 'Quantité', 'Seuil', 'Statut', 'Mis à jour', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                                                style={{ color: COLORS.primary, opacity: 0.7 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((stock, i) => (
                                        <tr key={stock.id}
                                            className="border-t hover:bg-gray-50 transition-colors"
                                            style={{ borderColor: COLORS.border, backgroundColor: i % 2 === 0 ? 'white' : `${COLORS.primary}02` }}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {stock.product?.imageUrl ? (
                                                        <img src={stock.product.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
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
                                                <span className="text-sm font-bold" style={{ color: getStatusColor(stock) }}>
                                                    {stock.quantity} {stock.product?.unit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                {stock.threshold} {stock.product?.unit}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: `${getStatusColor(stock)}15`, color: getStatusColor(stock) }}>
                                                    {getStatusText(stock)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                {new Date(stock.updatedAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setAdjustModal({ stock, mode: 'add' }); setAdjustQty(1); }}
                                                        className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                                        style={{ color: COLORS.success }} title="Ajouter stock">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => { setAdjustModal({ stock, mode: 'remove' }); setAdjustQty(1); }}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        style={{ color: COLORS.danger }} title="Retirer stock">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal d'ajustement */}
            {adjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdjustModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.primary }}>
                            {adjustModal.mode === 'add' ? 'Ajouter du stock' : 'Retirer du stock'}
                        </h3>
                        <p className="text-sm mb-4" style={{ color: COLORS.primary, opacity: 0.6 }}>
                            {adjustModal.stock.product?.name} — Stock actuel: <strong>{adjustModal.stock.quantity}</strong>
                        </p>
                        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>Quantité</label>
                        <input type="number" min="1" value={adjustQty}
                            onChange={e => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border rounded-xl text-sm mb-4 focus:outline-none"
                            style={{ borderColor: COLORS.border }} />
                        <div className="flex gap-3">
                            <button onClick={() => setAdjustModal(null)}
                                className="flex-1 px-4 py-2 rounded-xl border text-sm"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}>Annuler</button>
                            <button onClick={handleAdjust} disabled={adjusting}
                                className="flex-1 px-4 py-2 rounded-xl text-sm text-white font-medium disabled:opacity-60 transition-opacity"
                                style={{ backgroundColor: adjustModal.mode === 'add' ? COLORS.success : COLORS.danger }}>
                                {adjusting ? '...' : adjustModal.mode === 'add' ? 'Ajouter' : 'Retirer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;