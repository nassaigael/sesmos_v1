import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Users, User, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import type { ChatMessage as ChatMessageType, ChatRoom as ChatRoomType } from '../../types/chat.types';

interface ChatRoomProps {
    room: ChatRoomType;
    messages: ChatMessageType[];
    onSendMessage: (content: string, mentions: any[]) => void;
    onTyping: (isTyping: boolean) => void;
    typingUsers: Map<string, string>;
    isConnected: boolean;
    loadingMessages: boolean;
    onLoadMore: () => void;
    onMessageUpdate?: () => void;
}

export interface ChatRoomRef {
    focusTextarea: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    white: '#FFFFFF'
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'ADMIN': return <ShieldAlert className="w-4 h-4" />;
        case 'MANAGER': return <Shield className="w-4 h-4" />;
        case 'TECHNICIAN': return <ShieldCheck className="w-4 h-4" />;
        default: return <User className="w-4 h-4" />;
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'MANAGER': return 'Manager';
        case 'TECHNICIAN': return 'Technicien';
        case 'CLIENT': return 'Client';
        default: return role;
    }
};

const getRoleColor = (role: string) => {
    switch (role) {
        case 'ADMIN': return '#DC3545';
        case 'MANAGER': return '#F5A623';
        case 'TECHNICIAN': return COLORS.primary;
        default: return COLORS.primary;
    }
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const ChatRoom = forwardRef<ChatRoomRef, ChatRoomProps>(({
    room,
    messages,
    onSendMessage,
    onTyping,
    typingUsers,
    isConnected,
    loadingMessages,
    onLoadMore,
    onMessageUpdate
}, ref) => {
    const { user } = useAuth();
    const [otherUser, setOtherUser] = useState<any>(null);
    const [otherUserImageError, setOtherUserImageError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focusTextarea: () => {
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    }));

    useEffect(() => {
        if (room.type === 'PRIVATE') {
            loadOtherUser();
        }
    }, [room]);

    const loadOtherUser = async () => {
        const otherId = room.participants?.find(p => p !== user?.id);
        if (otherId) {
            try {
                const users = await chatService.getAvailableUsers();
                const found = users.find(u => u.id === otherId);
                if (found) {
                    setOtherUser(found);
                }
            } catch (error) {
                console.error('Error loading other user:', error);
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                scrollToBottom();
            }
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLoadMore = () => {
        if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0) {
            onLoadMore();
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: string) => {
        const msgDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (msgDate.toDateString() === today.toDateString()) {
            return `Aujourd'hui à ${formatTime(date)}`;
        } else if (msgDate.toDateString() === yesterday.toDateString()) {
            return `Hier à ${formatTime(date)}`;
        } else {
            return msgDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ` à ${formatTime(date)}`;
        }
    };

    const renderTypingIndicator = () => {
        const typingList = Array.from(typingUsers.entries())
            .filter(([userId]) => userId !== user?.id)
            .map(([_, userName]) => userName);

        if (typingList.length === 0) return null;
        if (typingList.length === 1) {
            return <p className="text-xs italic ml-1" style={{ color: COLORS.primary, opacity: 0.5 }}>{typingList[0]} écrit...</p>;
        }
        if (typingList.length === 2) {
            return <p className="text-xs italic ml-1" style={{ color: COLORS.primary, opacity: 0.5 }}>{typingList[0]} et {typingList[1]} écrivent...</p>;
        }
        return <p className="text-xs italic ml-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Plusieurs personnes écrivent...</p>;
    };

    const getOtherParticipantName = () => {
        if (room.type !== 'PRIVATE') return room.name;
        if (otherUser) return otherUser.name;
        const otherId = room.participants?.find(p => p !== user?.id);
        if (otherId) {
            const nameParts = room.name.split(' - ');
            const firstName = nameParts[0];
            const secondName = nameParts[1] || nameParts[0];
            if (firstName === user?.name) {
                return secondName;
            }
            return firstName;
        }
        return room.name || 'Conversation';
    };

    const displayName = getOtherParticipantName();
    const displayRole = otherUser?.role || (room.type === 'PRIVATE' ? 'CLIENT' : null);

    const isMessageVisible = (message: ChatMessageType): boolean => {
        if (message.deletedForEveryone) return false;
        if (message.deleted) return false;
        return true;
    };

    const visibleMessages = messages.filter(isMessageVisible);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-3">
                    {room.type === 'PRIVATE' && otherUser && (
                        <div className="shrink-0">
                            {otherUser.imageUrl && !otherUserImageError ? (
                                <img
                                    src={otherUser.imageUrl}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-full object-cover border-2"
                                    style={{ borderColor: COLORS.accent }}
                                    onError={() => setOtherUserImageError(true)}
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                    style={{ backgroundColor: getRoleColor(displayRole) }}
                                >
                                    {getInitials(displayName)}
                                </div>
                            )}
                        </div>
                    )}
                    {room.type !== 'PRIVATE' && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}15` }}>
                            <Users className="w-5 h-5" style={{ color: COLORS.accent }} />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg truncate" style={{ color: COLORS.primary }}>{displayName}</h2>
                        {displayRole && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs" style={{ color: getRoleColor(displayRole), opacity: 0.7 }}>
                                    {getRoleIcon(displayRole)}
                                </span>
                                <span className="text-xs" style={{ color: getRoleColor(displayRole), opacity: 0.7 }}>
                                    {getRoleLabel(displayRole)}
                                </span>
                            </div>
                        )}
                        {room.type !== 'PRIVATE' && (
                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                {room.type === 'EQUIPMENT' ? 'Discussion technique' :
                                    room.type === 'PRODUCT' ? 'Discussion produit' : 'Discussion générale'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2"
                onScroll={handleLoadMore}
            >
                {loadingMessages && (
                    <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
                    </div>
                )}

                {visibleMessages.map((message, index) => {
                    const showDate = index === 0 || new Date(message.createdAt).toDateString() !== new Date(visibleMessages[index - 1]?.createdAt).toDateString();

                    return (
                        <div key={message.id}>
                            {showDate && (
                                <div className="flex justify-center my-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary, opacity: 0.5 }}>
                                        {formatDate(message.createdAt)}
                                    </span>
                                </div>
                            )}
                            <ChatMessage
                                message={message}
                                onMessageUpdate={onMessageUpdate}
                            />
                        </div>
                    );
                })}

                {renderTypingIndicator()}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                onSendMessage={onSendMessage}
                onTyping={onTyping}
                disabled={!isConnected}
                isConnected={isConnected}
            />
        </div>
    );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;