import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, TypingIndicator } from '../types/chat.types';

export const useChatWebSocket = (roomId: string | null) => {
    const { token } = useAuth();
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        const socket = new SockJS('http://localhost:8080/ws-chat');

        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: token ? {
                Authorization: `Bearer ${token}`
            } : {},
            debug: (str) => {
                if (str.includes('ERROR') || str.includes('error')) {
                    console.warn('WebSocket debug:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('WebSocket connected');
            setIsConnected(true);

            client.subscribe(`/topic/chat/${roomId}`, (message) => {
                try {
                    const newMessage: ChatMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });

            client.subscribe(`/topic/chat/${roomId}/typing`, (message) => {
                try {
                    const indicator: TypingIndicator = JSON.parse(message.body);
                    if (indicator.typing) {
                        setTypingUsers(prev => new Map(prev).set(indicator.userId, indicator.userName));
                        setTimeout(() => {
                            setTypingUsers(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(indicator.userId);
                                return newMap;
                            });
                        }, 3000);
                    }
                } catch (e) {
                    console.error('Error parsing typing indicator:', e);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            setIsConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
            setIsConnected(false);
        };

        client.onDisconnect = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [roomId, token]);

    const sendMessage = useCallback((content: string, mentions?: any[]) => {
        if (stompClient && isConnected && roomId) {
            stompClient.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({ content, roomId, mentions })
            });
        }
    }, [stompClient, isConnected, roomId]);

    const sendTyping = useCallback((isTyping: boolean) => {
        if (stompClient && isConnected && roomId) {
            stompClient.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({
                    roomId,
                    typing: isTyping
                })
            });
        }
    }, [stompClient, isConnected, roomId]);

    return {
        messages,
        typingUsers,
        isConnected,
        sendMessage,
        sendTyping,
        setMessages
    };
};