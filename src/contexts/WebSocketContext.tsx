// contexts/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

interface WebSocketMessage {
    type: string;
    message: string;
    reason?: string;
    timestamp: number;
    data?: any;
}

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    sendMessage: (destination: string, body: any) => void;
    subscribeToTopic: (topic: string, callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

    const sendMessage = useCallback((destination: string, body: any) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination,
                body: JSON.stringify(body)
            });
        }
    }, []);

    const subscribeToTopic = useCallback((topic: string, callback: (message: WebSocketMessage) => void) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            const subscription = stompClientRef.current.subscribe(topic, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
            subscriptionsRef.current.set(topic, () => subscription.unsubscribe());
            return () => {
                const unsubscribe = subscriptionsRef.current.get(topic);
                if (unsubscribe) {
                    unsubscribe();
                    subscriptionsRef.current.delete(topic);
                }
            };
        }
        return () => { };
    }, []);

    const connect = useCallback(() => {
        if (!token || !user) {
            console.log('No token or user, skipping WebSocket connection');
            return;
        }

        console.log('Connecting to WebSocket...');
        const socket = new SockJS('http://localhost:8080/ws');

        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('WebSocket debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('✅ WebSocket connecté');
            setIsConnected(true);

            // S'abonner aux canaux personnels
            client.subscribe(`/user/queue/force-logout`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Reçu force logout:', data);
                    setLastMessage(data);
                    if (data.type === 'FORCE_LOGOUT') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                } catch (e) {
                    console.error('Error parsing force logout message:', e);
                }
            });

            client.subscribe(`/user/queue/account-status`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Statut du compte:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing account status message:', e);
                }
            });

            client.subscribe(`/user/queue/notifications`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Notification reçue:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing notification message:', e);
                }
            });

            // S'abonner aux topics globaux pour les notifications admin
            client.subscribe(`/topic/sales`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Nouvelle vente notification:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing sales notification:', e);
                }
            });

            client.subscribe(`/topic/alerts`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Alerte reçue:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing alert:', e);
                }
            });

            client.subscribe(`/topic/stock`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Alerte stock:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing stock alert:', e);
                }
            });

            client.subscribe(`/topic/maintenance`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Maintenance notification:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing maintenance notification:', e);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('❌ WebSocket STOMP error:', frame);
            setIsConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.error('❌ WebSocket error:', event);
            setIsConnected(false);
        };

        client.onDisconnect = () => {
            console.log('🔌 WebSocket déconnecté');
            setIsConnected(false);
        };

        client.activate();
        stompClientRef.current = client;
    }, [token, user]);

    const disconnect = useCallback(() => {
        if (stompClientRef.current) {
            subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
            subscriptionsRef.current.clear();
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage, subscribeToTopic }}>
            {children}
        </WebSocketContext.Provider>
    );
};