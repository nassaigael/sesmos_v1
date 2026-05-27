import api from '../api/axiosConfig';
import type { ChatRoom, SearchResult, ChatMessage } from '../types/chat.types';

class ChatService {
    private static instance: ChatService;

    static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    async getUserRooms(): Promise<ChatRoom[]> {
        const response = await api.get('/chat/rooms');
        return response.data;
    }

    async getMessages(roomId: string, page: number = 0, size: number = 50): Promise<any> {
        const response = await api.get(`/chat/rooms/${roomId}/messages`, {
            params: { page, size }
        });
        return response.data;
    }

    async createRoom(name: string, type: string, participants: string[]): Promise<ChatRoom> {
        const response = await api.post('/chat/rooms', null, {
            params: { name, type, participants: participants.join(',') }
        });
        return response.data;
    }

    async getAvailableUsers(): Promise<any[]> {
        const response = await api.get('/chat/users');
        return response.data;
    }

    async getOrCreatePrivateChat(userId: string): Promise<ChatRoom> {
        const response = await api.post(`/chat/private/${userId}`);
        return response.data;
    }

    async searchUsers(query: string): Promise<SearchResult[]> {
        const response = await api.get('/chat/search/users', { params: { query } });
        return response.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            type: 'USER' as const,
            subtitle: u.email,
            email: u.email,
            role: u.role,
            imageUrl: u.imageUrl
        }));
    }

    async searchEquipment(query: string): Promise<SearchResult[]> {
        const response = await api.get('/chat/search/equipment', { params: { query } });
        return response.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            type: 'EQUIPMENT' as const,
            subtitle: e.serialNumber,
            serialNumber: e.serialNumber,
            status: e.status,
            clientName: e.clientName,
            imageUrl: e.imageUrl
        }));
    }

    async searchProducts(query: string): Promise<SearchResult[]> {
        const response = await api.get('/chat/search/products', { params: { query } });
        return response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: 'PRODUCT' as const,
            subtitle: p.category || 'Produit',
            category: p.category,
            price: p.price,
            imageUrl: p.imageUrl
        }));
    }

    async deleteRoom(roomId: string): Promise<void> {
        await api.delete(`/chat/rooms/${roomId}`);
    }

    async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
        const response = await api.put(`/chat/messages/${messageId}`, { content });
        return response.data;
    }
}

export default ChatService.getInstance();