// services/productService.ts
import api from '../api/axiosConfig';
import type { Product, ProductRequest, ProductFilters, ProductCategory, ProductStats } from '../types/product';

class ProductService {
    private static instance: ProductService;

    static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }

    // Récupérer tous les produits (paginated)
    async getProducts(page: number = 0, size: number = 12, sort?: string): Promise<any> {
        const response = await api.get('/products', {
            params: { page, size, sort }
        });
        return response.data;
    }

    // Récupérer un produit par ID
    async getProductById(id: string): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data;
    }

    // Créer un produit
    async createProduct(productRequest: ProductRequest): Promise<Product> {
        const response = await api.post('/products', productRequest);
        return response.data;
    }

    // Mettre à jour un produit
    async updateProduct(id: string, productRequest: ProductRequest): Promise<Product> {
        const response = await api.put(`/products/${id}`, productRequest);
        return response.data;
    }

    // Supprimer un produit
    async deleteProduct(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    }

    // Récupérer les produits avec filtres
    async getProductsWithFilters(filters: ProductFilters, page: number = 0, size: number = 12): Promise<any> {
        const response = await api.get('/products/filter', {
            params: { ...filters, page, size }
        });
        return response.data;
    }

    // Upload d'image vers GitHub
    async uploadImage(file: File, category: string = 'general'): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', category);

        const response = await api.post('/products/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000
        });

        return response.data.imageUrl;
    }

    // Upload temporaire pour preview
    async uploadTempImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/products/upload-temp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response.data.imageUrl;
    }

    // Supprimer une image de GitHub
    async deleteImage(imageUrl: string): Promise<void> {
        await api.delete(`/products/image`, { params: { imageUrl } });
    }

    // Récupérer les catégories
    async getCategories(): Promise<ProductCategory[]> {
        try {
            const response = await api.get('/products/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [
                { name: 'CONSTRUCTION', displayName: 'Construction', description: 'Matériaux et équipements de construction' },
                { name: 'ELECTRICITY', displayName: 'Électricité', description: 'Matériel électrique et éclairage' },
                { name: 'PLUMBING', displayName: 'Plomberie', description: 'Équipements de plomberie et sanitaires' },
                { name: 'TOOLS', displayName: 'Outillage', description: 'Outils manuels et électriques' },
                { name: 'INDUSTRIAL', displayName: 'Industriel', description: 'Équipements et machines industrielles' },
                { name: 'AGRICULTURAL', displayName: 'Agricole', description: 'Matériel agricole et d\'élevage' },
                { name: 'SPARE_PARTS', displayName: 'Pièces détachées', description: 'Pièces de rechange et accessoires' }
            ];
        }
    }

    // Mettre à jour le stock
    async updateStock(productId: string, quantity: number): Promise<Product> {
        const response = await api.patch(`/products/${productId}/stock`, { quantity });
        return response.data;
    }

    // Récupérer les alertes de stock
    async getStockAlerts(): Promise<Product[]> {
        const response = await api.get('/products/stock-alerts');
        return response.data;
    }

    // Export Excel
    async exportToExcel(filters?: ProductFilters): Promise<Blob> {
        const response = await api.get('/products/export/excel', {
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    }

    // Récupérer les statistiques
    async getStats(): Promise<ProductStats> {
        const response = await api.get('/products/stats');
        return response.data;
    }
}

export default ProductService.getInstance();