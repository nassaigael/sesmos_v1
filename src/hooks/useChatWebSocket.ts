import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { ChatMessage, TypingIndicator } from '../types/chat.types';

const getWebSocketUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080/ws-chat';
    }
    return `http://${hostname}:8080/ws-chat`;
};

export const useChatWebSocket = (roomId: string | null, onMessageUpdate?: () => void) => {
    const { token, user } = useAuth();
    const { addNotification } = useNotifications();
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!roomId) {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
                setIsConnected(false);
            }
            return;
        }

        const socket = new SockJS(getWebSocketUrl());

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
            console.log('WebSocket connected for room:', roomId);
            setIsConnected(true);

            const messageSub = client.subscribe(`/topic/chat/${roomId}`, (message) => {
                try {
                    const newMessage: ChatMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);

                    if (newMessage.user?.id !== user?.id) {
                        addNotification({
                            title: 'Nouveau message',
                            message: newMessage.content.length > 100
                                ? newMessage.content.substring(0, 100) + '...'
                                : newMessage.content,
                            type: 'message',
                            user: {
                                name: newMessage.user?.name || 'Inconnu',
                                imageUrl: newMessage.user?.imageUrl
                            },
                            roomId: roomId
                        });
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });

            const deleteSub = client.subscribe(`/topic/chat/${roomId}/delete`, (data) => {
                try {
                    const event = JSON.parse(data.body);
                    console.log('Delete event received:', event);

                    if (onMessageUpdate && updateTimeoutRef.current === null) {
                        updateTimeoutRef.current = setTimeout(() => {
                            onMessageUpdate();
                            updateTimeoutRef.current = null;
                        }, 100);
                    }
                } catch (e) {
                    console.error('Error parsing delete event:', e);
                }
            });

            const typingSub = client.subscribe(`/topic/chat/${roomId}/typing`, (message) => {
                try {
                    const indicator: TypingIndicator = JSON.parse(message.body);

                    if (indicator.typing && indicator.userId !== user?.id) {
                        setTypingUsers(prev => {
                            const newMap = new Map(prev);
                            newMap.set(indicator.userId, indicator.userName);
                            return newMap;
                        });
                        setTimeout(() => {
                            setTypingUsers(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(indicator.userId);
                                return newMap;
                            });
                        }, 3000);
                    } else if (!indicator.typing) {
                        setTypingUsers(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(indicator.userId);
                            return newMap;
                        });
                    }
                } catch (e) {
                    console.error('Error parsing typing indicator:', e);
                }
            });

            return () => {
                messageSub.unsubscribe();
                deleteSub.unsubscribe();
                typingSub.unsubscribe();
            };
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
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = null;
            }
        };
    }, [roomId, token, user?.id, user?.name, addNotification, onMessageUpdate]);

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