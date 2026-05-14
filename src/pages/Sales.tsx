// pages/Sales.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import SalesList from '../components/sales/SalesCard';
import SalesAnalytics from '../components/sales/SalesAnalytics';
import SaleForm from '../components/sales/SaleForm';

type SalesView = 'list' | 'analytics';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const Sales: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [view, setView] = useState<SalesView>(() => {
        const saved = localStorage.getItem('salesViewMode');
        return (saved === 'list' || saved === 'analytics') ? saved : 'list';
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [, setFilterCount] = useState(0);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [showSaleForm, setShowSaleForm] = useState(false);

    // Écouter l'événement d'ouverture du formulaire de vente
    useEffect(() => {
        const handleOpenForm = () => {
            setShowSaleForm(true);
        };
        window.addEventListener('openSaleForm', handleOpenForm);
        return () => window.removeEventListener('openSaleForm', handleOpenForm);
    }, []);

    const handleViewChange = (newView: SalesView) => {
        setView(newView);
        localStorage.setItem('salesViewMode', newView);
    };

    const handleAddSale = () => {
        setShowSaleForm(true);
    };

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('refreshSales'));
    }, []);

    const handleCloseForm = () => {
        setShowSaleForm(false);
        handleRefresh();
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        window.dispatchEvent(new CustomEvent('searchSales', { detail: term }));
    };

    const handleFilterToggle = () => {
        setShowFilters(!showFilters);
        window.dispatchEvent(new CustomEvent('toggleFilters', { detail: !showFilters }));
    };

    const handleViewModeToggle = () => {
        handleViewChange(view === 'list' ? 'analytics' : 'list');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="sales"
                onAdd={view === 'list' ? handleAddSale : undefined}
                onSearch={view === 'list' ? handleSearch : undefined}
                onFilterToggle={view === 'list' ? handleFilterToggle : undefined}
                showAddButton={view === 'list'}
                showSearch={view === 'list'}
                showFilter={view === 'list'}
                showViewToggle={true}
                onViewModeToggle={handleViewModeToggle}
                viewMode={view === 'list' ? 'list' : 'analytics'}
                searchValue={searchTerm}
                filterActive={showFilters}
                totalCount={view === 'list' ? totalCount : undefined}
            />

            <div className="p-4 md:p-6">
                {view === 'list' ? (
                    <SalesList
                        key={refreshKey}
                        externalSearch={searchTerm}
                        externalShowFilters={showFilters}
                        onTotalCountChange={setTotalCount}
                        onRefresh={handleRefresh}
                        onFilterCountChange={setFilterCount}
                    />
                ) : (
                    <SalesAnalytics
                        period={period}
                        onPeriodChange={setPeriod}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                    />
                )}
            </div>

            {/* Formulaire de création de vente */}
            {showSaleForm && (
                <SaleForm
                    isOpen={showSaleForm}
                    onClose={handleCloseForm}
                    onSuccess={handleCloseForm}
                />
            )}
        </div>
    );
};

export default Sales;