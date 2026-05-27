import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MoreVertical, Edit2, Trash2, X, Check } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';
import chatService from '../../services/chatService';

interface ChatMessageProps {
    message: ChatMessageType;
    onMessageUpdated?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onMessageUpdated }) => {
    const { user } = useAuth();
    const isOwn = message.user?.id === user?.id;
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleEdit = async () => {
        if (editContent.trim() === message.content) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await chatService.updateMessage(message.id, editContent);
            if (onMessageUpdated) onMessageUpdated();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEdit();
        } else if (e.key === 'Escape') {
            setEditContent(message.content);
            setIsEditing(false);
        }
    };

    const renderContent = () => {
        if (isEditing) {
            return (
                <div className="relative">
                    <textarea
                        ref={editInputRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none"
                        style={{ borderColor: COLORS.border }}
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => {
                                setEditContent(message.content);
                                setIsEditing(false);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={isLoading || !editContent.trim()}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" style={{ color: COLORS.accent }} />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                {message.edited && (
                    <span className="text-xs italic mt-1 block" style={{ color: COLORS.primary, opacity: 0.3 }}>
                        (modifié)
                    </span>
                )}
            </div>
        );
    };

    const renderContentWithMentions = () => {
        if (!message.mentions || message.mentions.length === 0) {
            return renderContent();
        }

        let content = message.content;
        const sortedMentions = [...message.mentions].sort((a, b) => b.name.length - a.name.length);

        sortedMentions.forEach(mention => {
            const mentionPattern = new RegExp(`@${mention.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
            const color = mention.type === 'USER' ? '#3B82F6' :
                mention.type === 'EQUIPMENT' ? '#F59E0B' : '#10B981';
            content = content.replace(mentionPattern, (match) => {
                return `<span class="mention" style="background-color: ${color}15; color: ${color}; padding: 2px 6px; border-radius: 12px; font-size: 12px; font-weight: 500; display: inline-block;">${match}</span>`;
            });
        });

        if (isEditing) {
            return renderContent();
        }

        return (
            <div>
                <div className="text-sm whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: content }} />
                {message.edited && (
                    <span className="text-xs italic mt-1 block" style={{ color: COLORS.primary, opacity: 0.3 }}>
                        (modifié)
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                        {message.user?.imageUrl ? (
                            <img
                                src={message.user.imageUrl}
                                alt={message.user.name}
                                className="w-5 h-5 rounded-full object-cover border"
                                style={{ borderColor: COLORS.accent }}
                            />
                        ) : (
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                {message.user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-medium" style={{ color: COLORS.primary }}>{message.user?.name}</span>
                    </div>
                )}

                <div
                    className={`rounded-2xl px-3 py-2 ${isOwn ? 'text-white' : ''}`}
                    style={
                        isOwn
                            ? { backgroundColor: COLORS.accent, color: COLORS.primary }
                            : { backgroundColor: COLORS.primary, color: COLORS.white }
                    }
                >
                    {renderContentWithMentions()}
                </div>

                <div className={`flex items-center gap-2 text-xs mt-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                    <span style={{ color: COLORS.primary, opacity: 0.4 }}>
                        {formatTime(message.createdAt)}
                    </span>
                    {isOwn && !isEditing && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                            >
                                <MoreVertical className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            </button>
                            {showMenu && (
                                <div className="absolute bottom-full right-0 mb-1 bg-white rounded-lg shadow-lg border overflow-hidden z-10 min-w-[120px]"
                                    style={{ borderColor: COLORS.border }}
                                >
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            setIsEditing(true);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                        style={{ color: COLORS.primary }}
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        Modifier
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;