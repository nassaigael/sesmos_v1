import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import ClientSaleCard from '../../components/client/ClientSaleCard';
import ClientSaleDetail from '../../components/client/ClientSaleDetail';
import { ShoppingBag, TrendingUp, Package, Search } from 'lucide-react';
import api from '../../api/axiosConfig';
import type { Sale } from '../../types/sales';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientSales: React.FC = () => {
    const { clientData, loading: clientLoading } = useClientAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0
    });

    useEffect(() => {
        if (clientData?.id) {
            loadSales();
            loadStats();
        }
    }, [clientData, page]);

    const loadSales = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/sales/client/${clientData?.id}`, {
                params: { page, size: 12 }
            });
            setSales(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/sales/stats');
            setStats({
                totalRevenue: response.data.totalRevenue || 0,
                totalSales: response.data.totalSales || 0,
                averageOrderValue: response.data.averageOrderValue || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.region?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewSale = (sale: Sale) => {
        setSelectedSale(sale);
        setShowDetail(true);
    };

    if (clientLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Chiffre d'affaires</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>
                                {stats.totalRevenue.toLocaleString()} Ar
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <TrendingUp className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Nombre de ventes</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>{stats.totalSales}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Panier moyen</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>
                                {stats.averageOrderValue.toLocaleString()} Ar
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Package className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: COLORS.border }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                </div>
            </div>

            {searchTerm && filteredSales.length > 0 && (
                <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                    {filteredSales.length} résultat{filteredSales.length > 1 ? 's' : ''} pour "{searchTerm}"
                </div>
            )}

            {filteredSales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center" style={{ borderColor: COLORS.border }}>
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>Aucune vente</h3>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Vous n'avez pas encore d'historique d'achats</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSales.map((sale) => (
                            <ClientSaleCard
                                key={sale.id}
                                sale={sale}
                                onView={handleViewSale}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-6">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                ◀ Précédent
                            </button>
                            <span className="text-sm" style={{ color: COLORS.primary }}>
                                Page {page + 1} / {totalPages}
                            </span>
                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                ({totalElements} ventes)
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

            {showDetail && selectedSale && (
                <ClientSaleDetail
                    isOpen={showDetail}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedSale(null);
                    }}
                    sale={selectedSale}
                />
            )}
        </div>
    );
};

export default ClientSales;