import React from 'react';
import { X, Calendar, Package, User, MapPin, DollarSign, Hash, Printer } from 'lucide-react';
import type { Sale } from '../../types/sales';

interface ClientSaleDetailProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientSaleDetail: React.FC<ClientSaleDetailProps> = ({ isOpen, onClose, sale }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div
                    className="fixed inset-0 backdrop-blur-md transition-all duration-300"
                    style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }}
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-6 pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <Package className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">Détail de la vente</h2>
                                        <p className="text-white/60 text-xs">Informations détaillées de la transaction</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
                                    >
                                        <Printer className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Hash className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.6 }} />
                                    <span className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.7 }}>N° Vente</span>
                                </div>
                                <p className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{sale.id.substring(0, 8)}...</p>
                            </div>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.6 }} />
                                    <span className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.7 }}>Date</span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                    {new Date(sale.date).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                    <Package className="w-3 h-3 text-white" />
                                </div>
                                <h3 className="font-semibold" style={{ color: COLORS.primary }}>Produit</h3>
                            </div>
                            <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="flex gap-4">
                                    {sale.product?.imageUrl && (
                                        <img
                                            src={sale.product.imageUrl}
                                            alt={sale.product.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-base" style={{ color: COLORS.primary }}>{sale.product?.name}</p>
                                        <p className="text-xs mt-0.5" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                            {sale.product?.categoryDisplayName || sale.product?.category}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: COLORS.borderLight }}>
                                <p className="text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Quantité</p>
                                <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{sale.quantity}</p>
                            </div>
                            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: COLORS.borderLight }}>
                                <p className="text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Prix unitaire</p>
                                <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{sale.unitPrice.toLocaleString()} Ar</p>
                            </div>
                            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
                                <p className="text-xs font-medium mb-1" style={{ color: COLORS.accent, opacity: 0.7 }}>Total TTC</p>
                                <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{sale.totalPrice.toLocaleString()} Ar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                        <User className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="font-semibold" style={{ color: COLORS.primary }}>Vendeur</h3>
                                </div>
                                <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="font-semibold" style={{ color: COLORS.primary }}>{sale.user?.name}</p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{sale.user?.email}</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                                        <MapPin className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="font-semibold" style={{ color: COLORS.primary }}>Région</h3>
                                </div>
                                <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="font-semibold" style={{ color: COLORS.primary }}>{sale.region?.name}</p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{sale.region?.country}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                    <DollarSign className="w-3 h-3" style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="font-semibold" style={{ color: COLORS.primary }}>Récapitulatif</h3>
                            </div>
                            <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-white/70">Montant total TTC</p>
                                        <p className="text-xs text-white/50">
                                            {sale.quantity} x {sale.unitPrice.toLocaleString()} Ar
                                        </p>
                                    </div>
                                    <span className="text-2xl font-bold text-[#FFC107]">
                                        {sale.totalPrice.toLocaleString()} Ar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t" style={{ borderColor: COLORS.border, backgroundColor: COLORS.borderLight }}>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 rounded-xl transition-all hover:bg-gray-100 text-sm font-medium"
                            style={{ color: COLORS.primary }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientSaleDetail;