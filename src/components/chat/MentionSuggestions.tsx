import React, { useState, useEffect, useRef } from 'react';
import { User, Package, Wrench, Search } from 'lucide-react';
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
    border: 'rgba(26, 60, 94, 0.1)'
};

const getIcon = (type: string) => {
    switch (type) {
        case 'USER': return <User className="w-4 h-4" />;
        case 'EQUIPMENT': return <Wrench className="w-4 h-4" />;
        case 'PRODUCT': return <Package className="w-4 h-4" />;
        default: return <Search className="w-4 h-4" />;
    }
};

const getColor = (type: string) => {
    switch (type) {
        case 'USER': return '#3B82F6';
        case 'EQUIPMENT': return '#F59E0B';
        case 'PRODUCT': return '#10B981';
        default: return COLORS.accent;
    }
};

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({ query, position, onSelect, onClose }) => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
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

                const allResults: SearchResult[] = [
                    ...users.map(u => ({ ...u, type: 'USER' as const })),
                    ...equipment.map(e => ({ ...e, type: 'EQUIPMENT' as const })),
                    ...products.map(p => ({ ...p, type: 'PRODUCT' as const }))
                ];
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

    if (results.length === 0 && !loading) return null;

    return (
        <div
            ref={containerRef}
            className="absolute z-50 w-80 bg-white rounded-xl shadow-lg border overflow-hidden"
            style={{
                top: position.top - 200,
                left: position.left,
                borderColor: COLORS.border,
                maxHeight: '300px',
                overflowY: 'auto'
            }}
        >
            <div className="p-2 border-b" style={{ borderColor: COLORS.border }}>
                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                    Mentions: Utilisateurs, Équipements, Produits
                </p>
            </div>
            {loading ? (
                <div className="p-4 text-center">
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: COLORS.accent }} />
                </div>
            ) : (
                results.map((result, index) => (
                    <button
                        key={`${result.type}-${result.id}`}
                        className={`w-full p-3 text-left transition-all hover:bg-gray-50 flex items-center gap-3 ${index === selectedIndex ? 'bg-yellow-50' : ''
                            }`}
                        onClick={() => onSelect(result)}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${getColor(result.type)}15` }}
                        >
                            {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{result.name}</p>
                            {result.subtitle && (
                                <p className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>{result.subtitle}</p>
                            )}
                        </div>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${getColor(result.type)}15`, color: getColor(result.type) }}
                        >
                            {result.type === 'USER' ? 'Utilisateur' : result.type === 'EQUIPMENT' ? 'Équipement' : 'Produit'}
                        </span>
                    </button>
                ))
            )}
        </div>
    );
};

export default MentionSuggestions;