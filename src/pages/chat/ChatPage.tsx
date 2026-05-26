import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import ChatRoom from '../../components/chat/ChatRoom';
import UserList from '../../components/chat/UserList';
import ChatRoomList from '../../components/chat/ChatRoomList';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { ChatRoom as ChatRoomType, ChatMessage } from '../../types/chat.types';
import { MessageSquare, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface ChatRoomRef {
    focusTextarea: () => void;
}

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA',
    white: '#FFFFFF'
};

const ChatPage: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const { user } = useAuth();
    useNotifications();
    const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
    const [rooms, setRooms] = useState<ChatRoomType[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showRoomList, setShowRoomList] = useState(!isMobile);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRoomRef = useRef<ChatRoomRef>(null);

    const { messages: wsMessages, typingUsers, isConnected, sendMessage, sendTyping } = useChatWebSocket(
        selectedRoom?.id || null
    );

    const handleTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            return;
        }
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            return;
        }
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!isMobile) return;

        const swipeDistance = touchStart - touchEnd;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) < minSwipeDistance) return;

        if (swipeDistance < 0 && !showRoomList && selectedRoom) {
            setShowRoomList(true);
        }

        if (swipeDistance > 0 && showRoomList && selectedRoom) {
            setShowRoomList(false);
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    const focusTextarea = () => {
        setTimeout(() => {
            if (chatRoomRef.current) {
                chatRoomRef.current.focusTextarea();
            }
        }, 300);
    };

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadMessages();
            if (isMobile) {
                setShowRoomList(false);
                focusTextarea();
            }
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (wsMessages.length > 0) {
            setMessages(prev => [...prev, ...wsMessages]);
        }
    }, [wsMessages]);

    const loadRooms = async () => {
        try {
            const data = await chatService.getUserRooms();
            setRooms(data);
            if (data.length > 0 && !selectedRoom) {
                setSelectedRoom(data[0]);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    };

    const loadMessages = async () => {
        if (!selectedRoom) return;
        setLoadingMessages(true);
        try {
            const response = await chatService.getMessages(selectedRoom.id, 0, 50);
            setMessages(response.content.reverse());
            setHasMore(response.content.length === 50);
            setPage(1);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleLoadMoreMessages = async () => {
        if (!selectedRoom || !hasMore || loadingMessages) return;
        setLoadingMessages(true);
        try {
            const response = await chatService.getMessages(selectedRoom.id, page, 50);
            const newMessages = response.content.reverse();
            setMessages(prev => [...newMessages, ...prev]);
            setHasMore(response.content.length === 50);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSelectUser = async (_userId: string, room: ChatRoomType) => {
        setSelectedRoom(room);
        setShowUserList(false);
        if (!rooms.find(r => r.id === room.id)) {
            setRooms(prev => [room, ...prev]);
        }
        if (isMobile) {
            setShowRoomList(false);
            focusTextarea();
        }
    };

    const handleSelectRoom = (room: ChatRoomType) => {
        setSelectedRoom(room);
        if (isMobile) {
            setShowRoomList(false);
            focusTextarea();
        }
    };

    const scrollToBottom = () => {
        const container = document.getElementById('messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const totalUnread = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

    const getRoomName = () => {
        if (!selectedRoom) return 'Conversation';
        if (selectedRoom.type !== 'PRIVATE') return selectedRoom.name;
        const otherId = selectedRoom.participants?.find(p => p !== user?.id);
        if (otherId) {
            const nameParts = selectedRoom.name.split(' - ');
            const firstName = nameParts[0];
            const secondName = nameParts[1] || nameParts[0];
            if (firstName === user?.name) return secondName;
            return firstName;
        }
        return selectedRoom.name;
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="dashboard"
            />

            <div
                className="flex h-[calc(100vh-73px)] relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={chatContainerRef}
            >
                <div className={`
                    ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80 shadow-xl transition-transform duration-300 ease-in-out' : 'relative w-80 shrink-0'}
                    ${isMobile && !showRoomList ? '-translate-x-full' : 'translate-x-0'}
                `}>
                    <ChatRoomList
                        selectedRoomId={selectedRoom?.id || null}
                        onSelectRoom={handleSelectRoom}
                        onCreateRoom={() => setShowUserList(true)}
                        isOpen={showRoomList}
                        onClose={() => setShowRoomList(false)}
                        isMobile={isMobile}
                    />
                </div>

                {isMobile && showRoomList && (
                    <div
                        className="fixed inset-0 bg-black/50 z-35 transition-opacity duration-300"
                        onClick={() => setShowRoomList(false)}
                    />
                )}

                {isMobile && selectedRoom && !showRoomList && totalUnread > 0 && (
                    <div
                        className="fixed left-2 top-1/2 transform -translate-y-1/2 z-30 animate-pulse cursor-pointer"
                        onClick={() => setShowRoomList(true)}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <span
                            className="absolute -top-1 -right-1 min-w-4.5 h-4 rounded-full text-[10px] flex items-center justify-center px-1 font-bold"
                            style={{ backgroundColor: '#DC3545', color: COLORS.white }}
                        >
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    </div>
                )}

                {isMobile && selectedRoom && showRoomList && (
                    <div
                        className="fixed right-2 top-1/2 transform -translate-y-1/2 z-30 cursor-pointer"
                        onClick={() => setShowRoomList(false)}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-white border"
                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedRoom ? (
                        <>
                            {isMobile && (
                                <div className="p-3 border-b flex items-center gap-3 bg-white shrink-0" style={{ borderColor: COLORS.border }}>
                                    <button
                                        onClick={() => setShowRoomList(true)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                                    >
                                        <Menu className="w-5 h-5" style={{ color: COLORS.primary }} />
                                    </button>
                                    <div className="flex-1">
                                        <h2 className="font-semibold truncate" style={{ color: COLORS.primary }}>
                                            {getRoomName()}
                                        </h2>
                                    </div>
                                    {totalUnread > 0 && (
                                        <span
                                            className="text-xs px-2 py-1 rounded-full shrink-0"
                                            style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                                        >
                                            {totalUnread}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <ChatRoom
                                    ref={chatRoomRef}
                                    key={selectedRoom.id}
                                    room={selectedRoom}
                                    messages={messages}
                                    onSendMessage={sendMessage}
                                    onTyping={sendTyping}
                                    typingUsers={typingUsers}
                                    isConnected={isConnected}
                                    loadingMessages={loadingMessages}
                                    onLoadMore={handleLoadMoreMessages}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-4">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <MessageSquare className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>Aucune conversation</h3>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Commencez une nouvelle conversation</p>
                                <button
                                    onClick={() => setShowUserList(true)}
                                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                                    style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                                >
                                    Nouvelle conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showUserList && user && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                        <UserList
                            onSelectUser={handleSelectUser}
                            onClose={() => setShowUserList(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;