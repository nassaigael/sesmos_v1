import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import ChatRoom from '../../components/chat/ChatRoom';
import UserList from '../../components/chat/UserList';
import ChatRoomList from '../../components/chat/ChatRoomList';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatRoom as ChatRoomType, ChatMessage } from '../../types/chat.types';
import { MessageSquare } from 'lucide-react';

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
    const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
    const [rooms, setRooms] = useState<ChatRoomType[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const { messages: wsMessages, typingUsers, isConnected, sendMessage, sendTyping } = useChatWebSocket(
        selectedRoom?.id || null
    );

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadMessages();
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
    };

    const handleSelectRoom = (room: ChatRoomType) => {
        setSelectedRoom(room);
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

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="dashboard"
            />

            <div className="flex h-[calc(100vh-73px)]">
                <div className="w-80 border-r bg-white flex flex-col" style={{ borderColor: COLORS.border }}>
                    <ChatRoomList
                        selectedRoomId={selectedRoom?.id || null}
                        onSelectRoom={handleSelectRoom}
                        onCreateRoom={() => setShowUserList(true)}
                    />
                </div>

                <div className="flex-1 flex flex-col bg-white">
                    {selectedRoom ? (
                        <ChatRoom
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
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <MessageSquare className="w-10 h-10" style={{ color: COLORS.accent, opacity: 0.6 }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primary }}>Aucune conversation sélectionnée</h3>
                                <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Choisissez une conversation ou créez-en une nouvelle</p>
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
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
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