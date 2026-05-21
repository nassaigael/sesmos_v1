import React, { useState } from 'react';
import { Calendar, Package, MapPin, DollarSign, Eye } from 'lucide-react';
import type { Sale } from '../../types/sales';

interface ClientSaleCardProps {
    sale: Sale;
    onView: (sale: Sale) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const ClientSaleCard: React.FC<ClientSaleCardProps> = ({ sale, onView }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.action-button')) return;
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
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{ backgroundColor: `${COLORS.accent}20`, color: COLORS.accent }}>
                        <Calendar className="w-3 h-3" />
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {sale.product?.imageUrl && !imageError ? (
                        <img
                            src={sale.product.imageUrl}
                            alt={sale.product.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}>
                            {sale.product?.name ? getInitials(sale.product.name) : 'P'}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.accent }}>
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {sale.product?.name || 'Produit'}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {sale.product?.categoryDisplayName || sale.product?.category || 'Catégorie'}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
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

                <div className="mb-4 p-2 rounded-lg text-center" style={{ backgroundColor: `${COLORS.accent}10` }}>
                    <p className="text-xs" style={{ color: COLORS.accent, opacity: 0.7 }}>Total TTC</p>
                    <p className="text-xl font-bold" style={{ color: COLORS.accent }}>
                        {sale.totalPrice.toLocaleString()} Ar
                    </p>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onView(sale); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium action-button"
                    style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary }}
                >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300"
                style={{ backgroundColor: COLORS.accent, transform: isHovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }} />
        </div>
    );
};

export default ClientSaleCard;