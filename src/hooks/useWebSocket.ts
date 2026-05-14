import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';

interface WebSocketMessage {
    type: string;
    message: string;
    reason?: string;
    timestamp: number;
}

export const useWebSocket = () => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const reconnectAttempts = useRef(0);

    const connect = useCallback(() => {
        if (!token || !user) {
            console.log('No token or user, skipping WebSocket connection');
            return;
        }

        console.log('Connecting to WebSocket...');

        // Utiliser SockJS avec l'URL de base (pas de token dans l'URL)
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
            reconnectAttempts.current = 0;

            // S'abonner au canal pour force logout
            client.subscribe(`/user/queue/force-logout`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Reçu force logout:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing force logout message:', e);
                }
            });

            // S'abonner au canal pour le statut du compte
            client.subscribe(`/user/queue/account-status`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Statut du compte:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing account status message:', e);
                }
            });

            // S'abonner aux notifications générales
            client.subscribe(`/user/queue/notifications`, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📢 Notification reçue:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing notification message:', e);
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
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { isConnected, lastMessage };
};