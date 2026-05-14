import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import ProductGridView from '../components/products/ProductGridView';
import ProductForm from '../components/products/ProductForm';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const Products: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [, setFilterCount] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        lowStock: false
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const handleResetSearch = () => {
            setSearchTerm('');
            setFilters({ category: '', minPrice: '', maxPrice: '', lowStock: false });
        };
        window.addEventListener('resetProductsFilters', handleResetSearch);
        return () => window.removeEventListener('resetProductsFilters', handleResetSearch);
    }, []);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedProduct(null);
        handleRefresh();
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleFilterToggle = () => {
        setShowFilters(!showFilters);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="products"
                onAdd={handleAddProduct}
                onSearch={handleSearch}
                onFilterToggle={handleFilterToggle}
                showAddButton={true}
                showSearch={true}
                showFilter={true}
                showViewToggle={false}
                searchValue={searchTerm}
                filterActive={showFilters}
                totalCount={totalCount}
            />

            <div className="p-4 md:p-6">
                <ProductGridView
                    key={refreshTrigger}
                    externalSearch={searchTerm}
                    externalShowFilters={showFilters}
                    externalFilters={filters}
                    onTotalCountChange={setTotalCount}
                    onRefresh={handleRefresh}
                    onFilterCountChange={setFilterCount}
                    onFilterChange={handleFilterChange}
                />
            </div>

            {showForm && (
                <ProductForm
                    isOpen={showForm}
                    onClose={handleCloseForm}
                    onSuccess={handleCloseForm}
                    editProduct={selectedProduct || undefined}
                />
            )}
        </div>
    );
};

export default Products;