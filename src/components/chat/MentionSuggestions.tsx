import React, { useState, useEffect, useRef } from 'react';
import { Search, Mail, Hash, Tag } from 'lucide-react';
import chatService from '../../services/chatService';
import type { SearchResult } from '../../types/chat.types';

interface MentionSuggestionsProps {
    query: string;
    position: { top: number; left: number };
    onSelect: (item: SearchResult) => void;
    onClose: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    white: '#FFFFFF'
};

const getColor = (type: string) => {
    switch (type) {
        case 'USER': return '#3B82F6';
        case 'EQUIPMENT': return '#F59E0B';
        case 'PRODUCT': return '#10B981';
        default: return COLORS.accent;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'USER': return 'Utilisateur';
        case 'EQUIPMENT': return 'Équipement';
        case 'PRODUCT': return 'Produit';
        default: return type;
    }
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({ query, position, onSelect, onClose }) => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const search = async () => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const [users, equipment, products] = await Promise.all([
                    chatService.searchUsers(query),
                    chatService.searchEquipment(query),
                    chatService.searchProducts(query)
                ]);

                const allResults: SearchResult[] = [...users, ...equipment, ...products];
                setResults(allResults.slice(0, 10));
                setSelectedIndex(0);
            } catch (error) {
                console.error('Error searching:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                onSelect(results[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex, onSelect, onClose]);

    const handleImageError = (id: string) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const renderAvatar = (result: SearchResult) => {
        const hasError = imageErrors[result.id];

        if (result.imageUrl && !hasError) {
            const isUser = result.type === 'USER';
            return (
                <img
                    src={result.imageUrl}
                    alt={result.name}
                    className={`w-10 h-10 ${isUser ? 'rounded-full' : 'rounded-lg'} object-cover border-2`}
                    style={{ borderColor: COLORS.accent }}
                    onError={() => handleImageError(result.id)}
                />
            );
        }

        return (
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: getColor(result.type) }}
            >
                {getInitials(result.name)}
            </div>
        );
    };

    const renderSubtitle = (result: SearchResult) => {
        if (result.type === 'USER') {
            const email = result.email || result.subtitle || '';
            return (
                <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <span className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {email.toLowerCase()}
                    </span>
                </div>
            );
        }

        if (result.type === 'EQUIPMENT') {
            const serialNumber = result.serialNumber || result.subtitle || '';
            const clientName = result.clientName || '';
            return (
                <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                        <span className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>
                            S/N: {serialNumber}
                        </span>
                    </div>
                    {clientName && (
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3" />
                            <span className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.4 }}>
                                {clientName}
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        if (result.type === 'PRODUCT') {
            const category = result.category || '';
            const price = result.price;
            return (
                <div className="flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <span className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>
                        {category}
                        {price && ` • ${price.toLocaleString()} Ar`}
                    </span>
                </div>
            );
        }

        if (result.subtitle) {
            return (
                <p className="text-xs truncate mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>
                    {result.subtitle}
                </p>
            );
        }

        return null;
    };

    if (results.length === 0 && !loading) return null;

    return (
        <div
            ref={containerRef}
            className="fixed z-50 w-96 bg-white rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{
                top: position.top,
                left: position.left,
                borderColor: COLORS.border,
                maxHeight: '360px',
                overflowY: 'auto'
            }}
        >
            <div className="p-3 border-b sticky top-0 bg-white" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" style={{ color: COLORS.accent }} />
                    <p className="text-xs font-medium" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Mentions: Utilisateurs · Équipements · Produits
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: COLORS.accent }} />
                    <p className="text-xs mt-2" style={{ color: COLORS.primary, opacity: 0.5 }}>Recherche en cours...</p>
                </div>
            ) : (
                <div className="py-1">
                    {results.map((result, index) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            className={`w-full p-3 text-left transition-all flex items-center gap-3 ${index === selectedIndex ? 'bg-yellow-50' : 'hover:bg-gray-50'
                                }`}
                            onClick={() => onSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="shrink-0">
                                {renderAvatar(result)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>
                                    {result.name}
                                </p>
                                {renderSubtitle(result)}
                            </div>

                            <div className="shrink-0">
                                <span
                                    className="text-xs px-2 py-1 rounded-full font-medium"
                                    style={{
                                        backgroundColor: `${getColor(result.type)}15`,
                                        color: getColor(result.type)
                                    }}
                                >
                                    {getTypeLabel(result.type)}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentionSuggestions;