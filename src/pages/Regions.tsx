import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import RegionForm from '../components/regions/RegionForm';
import RegionCard from '../components/regions/RegionCard';
import { MapPin, Plus, RefreshCw, WifiOff } from 'lucide-react';
import regionService from '../services/regionService';
import type { Region } from '../types/region.types';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)'
};

const Regions: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editRegion, setEditRegion] = useState<Region | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const isLoadingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearLoadingTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const loadRegions = useCallback(async () => {
        if (isLoadingRef.current) return;

        clearLoadingTimeout();
        setIsTimeout(false);

        timeoutRef.current = setTimeout(() => {
            setIsTimeout(true);
        }, 15000);

        try {
            isLoadingRef.current = true;
            setLoading(true);
            setError(null);
            const response = await regionService.getRegionsWithFilters(
                { search: searchTerm || undefined },
                page,
                12
            );
            clearLoadingTimeout();
            setRegions(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err) {
            console.error('Error loading regions:', err);
            setError('Impossible de charger la liste des régions. Vérifiez votre connexion.');
            setRegions([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
            clearLoadingTimeout();
        }
    }, [page, searchTerm]);

    useEffect(() => {
        loadRegions();
    }, [loadRegions, retryCount]);

    const handleRefresh = () => {
        setRetryCount(prev => prev + 1);
        setPage(0);
        loadRegions();
    };

    const openCreate = () => {
        setEditRegion(null);
        setShowForm(true);
    };

    const openEdit = (region: Region) => {
        setEditRegion(region);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Supprimer cette région ? Cette action peut affecter les produits associés.')) return;
        try {
            await regionService.deleteRegion(id);
            loadRegions();
        } catch (e) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditRegion(null);
        loadRegions();
    };

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
            <div className="relative flex justify-center -mt-12">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
            </div>
            <div className="p-4 pt-6 text-center">
                <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-4"></div>
                <div className="flex justify-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );

    const TimeoutSkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }} />
            <div className="relative flex justify-center -mt-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg">
                    <WifiOff className="w-8 h-8" style={{ color: COLORS.warning, opacity: 0.6 }} />
                </div>
            </div>
            <div className="p-4 pt-6 text-center">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
        </div>
    );

    const ErrorState = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-auto shadow-lg">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.border }}>
                    <WifiOff className="w-10 h-10" style={{ color: COLORS.warning }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.primary }}>Erreur de connexion</h3>
                <p className="text-sm mb-6" style={{ color: COLORS.primary, opacity: 0.6 }}>{error || 'Impossible de contacter le serveur'}</p>
                <button
                    onClick={handleRefresh}
                    className="px-5 py-2 rounded-xl text-white font-medium flex items-center gap-2 mx-auto transition-all hover:opacity-90"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                </button>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.primary, opacity: 0.2 }} />
            <p className="text-lg" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucune région trouvée</p>
            <button
                onClick={openCreate}
                className="mt-4 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90 flex items-center gap-2 mx-auto"
                style={{ backgroundColor: COLORS.primary }}
            >
                <Plus className="w-4 h-4" />
                Ajouter une région
            </button>
        </div>
    );

    if (error && !loading && regions.length === 0) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
                <Header
                    toggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    currentPage="regions"
                    onAdd={openCreate}
                    onSearch={setSearchTerm}
                    showAddButton={true}
                    showSearch={true}
                    totalCount={totalElements}
                />
                <div className="p-4 md:p-6">
                    <ErrorState />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="regions"
                onAdd={openCreate}
                onSearch={setSearchTerm}
                showAddButton={true}
                showSearch={true}
                totalCount={totalElements}
            />

            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isTimeout ? (
                            [...Array(8)].map((_, i) => <TimeoutSkeletonCard key={i} />)
                        ) : (
                            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                        )}
                    </div>
                ) : regions.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {searchTerm && !loading && regions.length > 0 && (
                            <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                {totalElements} résultat{totalElements > 1 ? 's' : ''} pour "{searchTerm}"
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {regions.map((region) => (
                                <RegionCard
                                    key={region.id}
                                    region={region}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-8">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    ◀ Précédent
                                </button>
                                <span className="text-sm" style={{ color: COLORS.primary }}>
                                    Page {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    Suivant ▶
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <RegionForm
                isOpen={showForm}
                onClose={handleFormClose}
                onSuccess={handleFormClose}
                editRegion={editRegion || undefined}
            />
        </div>
    );
};

export default Regions;