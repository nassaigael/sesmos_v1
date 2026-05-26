import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Users, Package, User, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import MentionSuggestions from './MentionSuggestions';
import type { ChatMessage as ChatMessageType, ChatRoom as ChatRoomType, SearchResult } from '../../types/chat.types';

interface ChatRoomProps {
    room: ChatRoomType;
    messages: ChatMessageType[];
    onSendMessage: (content: string, mentions: any[]) => void;
    onTyping: (isTyping: boolean) => void;
    typingUsers: Map<string, string>;
    isConnected: boolean;
    loadingMessages: boolean;
    onLoadMore: () => void;
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

const ChatRoom: React.FC<ChatRoomProps> = ({
    room,
    messages,
    onSendMessage,
    onTyping,
    typingUsers,
    isConnected,
    loadingMessages,
    onLoadMore
}) => {
    const { user } = useAuth();
    const [inputMessage, setInputMessage] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentions, setMentions] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    const [searching, setSearching] = useState(false);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [otherUserImageError, setOtherUserImageError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const searchMentions = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const [users, equipment, products] = await Promise.all([
                chatService.searchUsers(query),
                chatService.searchEquipment(query),
                chatService.searchProducts(query)
            ]);

            const allResults = [...users, ...equipment, ...products];
            setSearchResults(allResults.slice(0, 10));
        } catch (error) {
            console.error('Error searching mentions:', error);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (mentionQuery.length > 1) {
            searchMentions(mentionQuery);
        } else {
            setSearchResults([]);
        }
    }, [mentionQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputMessage(value);

        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);

        const cursorPos = e.target.selectionStart;
        setCursorPosition(cursorPos);

        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1 && cursorPos - lastAtIndex > 1) {
            const query = textBeforeCursor.substring(lastAtIndex + 1);
            if (query.length > 0 && !query.includes(' ')) {
                setMentionQuery(query);
                setShowMentions(true);
                if (textareaRef.current) {
                    const rect = textareaRef.current.getBoundingClientRect();
                    setMentionPosition({
                        top: rect.top - 250,
                        left: rect.left
                    });
                }
                return;
            }
        }
        setShowMentions(false);
    };

    const handleSelectMention = (item: SearchResult) => {
        const textBeforeCursor = inputMessage.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = inputMessage.substring(cursorPosition);

        const newMessage = textBeforeCursor.substring(0, lastAtIndex) + `@${item.name} ` + textAfterCursor;

        setInputMessage(newMessage);
        setMentions([...mentions, {
            type: item.type,
            id: item.id,
            name: item.name
        }]);
        setShowMentions(false);
        setSearchResults([]);
        setMentionQuery('');

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = lastAtIndex + item.name.length + 2;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() && isConnected) {
            onSendMessage(inputMessage, mentions);
            setInputMessage('');
            setMentions([]);
            onTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showMentions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedMentionIndex(prev => Math.min(prev + 1, searchResults.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedMentionIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && searchResults[selectedMentionIndex]) {
                e.preventDefault();
                handleSelectMention(searchResults[selectedMentionIndex]);
            } else if (e.key === 'Escape') {
                setShowMentions(false);
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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

    const renderContentWithMentions = (content: string, messageMentions?: any[]) => {
        if (!messageMentions || messageMentions.length === 0) {
            return <p className="text-sm whitespace-pre-wrap wrap-break-word">{content}</p>;
        }

        let htmlContent = content;
        const sortedMentions = [...messageMentions].sort((a, b) => b.name.length - a.name.length);

        sortedMentions.forEach(mention => {
            const mentionPattern = new RegExp(`@${mention.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
            const color = mention.type === 'USER' ? '#3B82F6' : mention.type === 'EQUIPMENT' ? '#F59E0B' : COLORS.primary;
            htmlContent = htmlContent.replace(mentionPattern, (match) => {
                return `<span class="mention" style="background-color: ${color}15; color: ${color}; padding: 2px 6px; border-radius: 12px; font-size: 12px; font-weight: 500; display: inline-block;">${match}</span>`;
            });
        });

        return <div className="text-sm whitespace-pre-wrap wrap-break-word" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputMessage]);

    const displayName = getOtherParticipantName();
    const displayRole = otherUser?.role || (room.type === 'PRIVATE' ? 'CLIENT' : null);

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

                {messages.map((message, index) => {
                    const showDate = index === 0 || new Date(message.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();
                    const isOwn = message.user?.id === user?.id;

                    return (
                        <div key={message.id}>
                            {showDate && (
                                <div className="flex justify-center my-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: COLORS.borderLight, color: COLORS.primary, opacity: 0.5 }}>
                                        {formatDate(message.createdAt)}
                                    </span>
                                </div>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {!isOwn && (
                                        <div className="flex items-center gap-2 mb-1 ml-1">
                                            {message.user?.imageUrl ? (
                                                <img src={message.user.imageUrl} alt={message.user.name} className="w-5 h-5 rounded-full object-cover border" style={{ borderColor: COLORS.accent }} />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: COLORS.primary }}>
                                                    {message.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-xs font-medium" style={{ color: COLORS.primary }}>{message.user?.name}</span>
                                        </div>
                                    )}
                                    <div
                                        className="rounded-2xl px-3 py-2"
                                        style={
                                            isOwn
                                                ? { backgroundColor: COLORS.accent, color: COLORS.primary }
                                                : { backgroundColor: COLORS.primary, color: COLORS.white }
                                        }
                                    >
                                        {renderContentWithMentions(message.content, message.mentions)}
                                    </div>
                                    <div className={`text-xs mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`} style={{ color: COLORS.primary, opacity: 0.4 }}>
                                        {formatTime(message.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {renderTypingIndicator()}
                <div ref={messagesEndRef} />
            </div>

            <div className="relative">
                {showMentions && searchResults.length > 0 && (
                    <MentionSuggestions
                        query={mentionQuery}
                        position={mentionPosition}
                        onSelect={handleSelectMention}
                        onClose={() => setShowMentions(false)}
                    />
                )}

                <div className="flex items-end gap-2 p-3 border-t" style={{ borderColor: COLORS.border }}>
                    <button className="p-2 rounded-lg transition-all hover:bg-gray-100 shrink-0" title="Joindre un fichier">
                        <Paperclip className="w-5 h-5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                    </button>
                    <button className="p-2 rounded-lg transition-all hover:bg-gray-100 shrink-0" title="Emoji">
                        <Smile className="w-5 h-5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Tapez votre message... Utilisez @ pour mentionner" : "Connexion en cours..."}
                        disabled={!isConnected}
                        rows={1}
                        className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{ borderColor: COLORS.border, maxHeight: '120px' }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !isConnected}
                        className="p-2 rounded-lg transition-all shrink-0 disabled:opacity-50"
                        style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;