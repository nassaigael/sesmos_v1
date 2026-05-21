import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Client } from '../types/client.types';
import api from '../api/axiosConfig';

interface ClientAuthContextType {
    clientData: Client | null;
    loading: boolean;
    refreshClientData: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const useClientAuth = () => {
    const context = useContext(ClientAuthContext);
    if (!context) {
        throw new Error('useClientAuth must be used within ClientAuthProvider');
    }
    return context;
};

interface ClientAuthProviderProps {
    children: ReactNode;
}

export const ClientAuthProvider: React.FC<ClientAuthProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [clientData, setClientData] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshClientData = async () => {
        if (!user?.clientId) {
            setClientData(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/clients/me');
            setClientData(response.data);
        } catch (error) {
            console.error('Error loading client data:', error);
            setClientData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshClientData();
    }, [user?.clientId]);

    return (
        <ClientAuthContext.Provider value={{ clientData, loading, refreshClientData }}>
            {children}
        </ClientAuthContext.Provider>
    );
};