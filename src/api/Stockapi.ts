import api from './axiosConfig';
import type { Stock, StockRequest } from '../types/Stock.types';

const stockApi = {
    getAll: () => api.get<Stock[]>('/stock').then(r => r.data),
    getById: (id: string) => api.get<Stock>(`/stock/${id}`).then(r => r.data),
    getByProduct: (productId: string) => api.get<Stock>(`/stock/product/${productId}`).then(r => r.data),
    getCritical: () => api.get<Stock[]>('/stock/critical').then(r => r.data),
    getOutOfStock: () => api.get<Stock[]>('/stock/out-of-stock').then(r => r.data),
    countCritical: () => api.get<number>('/stock/critical/count').then(r => r.data),
    update: (productId: string, data: StockRequest) =>
        api.put<Stock>(`/stock/product/${productId}`, data).then(r => r.data),
    addStock: (productId: string, quantity: number) =>
        api.post<Stock>(`/stock/product/${productId}/add`, null, { params: { quantity } }).then(r => r.data),
    removeStock: (productId: string, quantity: number) =>
        api.post<Stock>(`/stock/product/${productId}/remove`, null, { params: { quantity } }).then(r => r.data),
};

export default stockApi;