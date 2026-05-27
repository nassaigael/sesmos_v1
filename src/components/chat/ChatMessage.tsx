import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeOff, Trash2, Paperclip, Smile } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';
import chatService from '../../services/chatService';
import ReactionPicker from './ReactionPicker';

interface ChatMessageProps {
    message: ChatMessageType;
    onMessageUpdate?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const REACTION_EMOJIS: Record<string, string> = {
    thumbs_up: '👍',
    thumbs_down: '👎',
    heart: '❤️',
    check: '✅',
    cross: '❌'
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onMessageUpdate }) => {
    const { user } = useAuth();
    const isOwn = message.user?.id === user?.id;
    const [showConfirmFor, setShowConfirmFor] = useState<'forMe' | 'forEveryone' | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' o';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    };

    const handleDeleteForMe = async () => {
        try {
            await chatService.deleteMessageForMe(message.id);
            if (onMessageUpdate) onMessageUpdate();
            setShowConfirmFor(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleDeleteForEveryone = async () => {
        try {
            await chatService.deleteMessageForEveryone(message.id);
            if (onMessageUpdate) onMessageUpdate();
            setShowConfirmFor(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleReaction = async (reactionType: string) => {
        try {
            await chatService.toggleReaction(message.id, reactionType);
            if (onMessageUpdate) onMessageUpdate();
            setShowReactionPicker(false);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const groupReactions = () => {
        if (!message.reactions || message.reactions.length === 0) return [];

        const grouped = new Map<string, { count: number; users: string[] }>();
        message.reactions.forEach(r => {
            if (!grouped.has(r.type)) {
                grouped.set(r.type, { count: 0, users: [] });
            }
            const g = grouped.get(r.type)!;
            g.count++;
            g.users.push(r.userName);
        });

        const currentUserReaction = message.reactions.find(r => r.userId === user?.id);

        return Array.from(grouped.entries()).map(([type, data]) => ({
            type,
            emoji: REACTION_EMOJIS[type] || '👍',
            count: data.count,
            users: data.users,
            isActive: currentUserReaction?.type === type,
            hasCurrentUser: data.users.includes(user?.name || '')
        }));
    };

    const isDeletedForEveryone = message.deletedForEveryone === true;
    const isDeletedForMe = message.deleted === true;
    const isDeleted = isDeletedForEveryone || isDeletedForMe;
    const reactions = groupReactions();
    const hasUserReaction = message.reactions?.some(r => r.userId === user?.id) || false;

    let deletedText = null;
    if (isDeletedForEveryone) {
        deletedText = "Message supprimé";
    } else if (isDeletedForMe) {
        deletedText = "Message supprimé";
    }

    if (isDeleted) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className="rounded-2xl px-3 py-2 bg-gray-100 text-gray-500 italic text-sm">
                        {deletedText}
                    </div>
                    <div className={`text-xs mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`} style={{ color: COLORS.primary, opacity: 0.4 }}>
                        {formatTime(message.createdAt)}
                    </div>
                </div>
            </div>
        );
    }

    const getTitle = () => {
        if (showConfirmFor === 'forMe') {
            return "Supprimer pour vous ?";
        }
        return "Supprimer pour tout le monde ?";
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
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
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>

                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {message.attachments.map((att) => (
                                <a
                                    key={att.id}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-1 rounded-lg hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: isOwn ? `${COLORS.primary}15` : `${COLORS.white}15` }}
                                >
                                    <Paperclip className="w-3 h-3" />
                                    <span className="text-xs truncate max-w-37.5">{att.fileName}</span>
                                    <span className="text-[10px] opacity-50">({formatFileSize(att.fileSize)})</span>
                                </a>
                            ))}
                        </div>
                    )}

                    {message.edited && (
                        <span className="text-[10px] italic mt-1 block" style={{ color: isOwn ? COLORS.primary : COLORS.white, opacity: 0.5 }}>
                            (modifié)
                        </span>
                    )}
                </div>

                {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-end">
                        {reactions.map((reaction) => (
                            <button
                                key={reaction.type}
                                onClick={() => handleReaction(reaction.type)}
                                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${reaction.isActive
                                    ? 'bg-yellow-100 border border-yellow-300'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                title={reaction.users.join(', ')}
                            >
                                <span className="text-sm">{reaction.emoji}</span>                    
                            </button>
                        ))}
                    </div>
                )}

                <div className={`flex items-center gap-2 text-[10px] mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span style={{ color: COLORS.primary, opacity: 0.4 }}>
                        {formatTime(message.createdAt)}
                    </span>

                    <div className="relative">
                        <button
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            className={`p-0.5 rounded hover:bg-gray-100 transition-colors ${hasUserReaction ? 'text-yellow-500' : ''}`}
                            title={hasUserReaction ? "Modifier votre réaction" : "Ajouter une réaction"}
                        >
                            <Smile className="w-3 h-3" style={{ color: hasUserReaction ? COLORS.accent : COLORS.primary, opacity: hasUserReaction ? 1 : 0.5 }} />
                        </button>
                        {showReactionPicker && (
                            <ReactionPicker
                                onSelect={handleReaction}
                                onClose={() => setShowReactionPicker(false)}
                            />
                        )}
                    </div>

                    {isOwn && (
                        <>
                            <button
                                onClick={() => setShowConfirmFor('forMe')}
                                className="p-0.5 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer pour moi"
                            >
                                <EyeOff className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            </button>
                            <button
                                onClick={() => setShowConfirmFor('forEveryone')}
                                className="p-0.5 rounded hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer pour tout le monde"
                            >
                                <Trash2 className="w-3 h-3" style={{ color: '#DC3545', opacity: 0.5 }} />
                            </button>
                        </>
                    )}
                </div>

                {showConfirmFor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-xl shadow-lg p-4 min-w-70 mx-4" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center">
                                <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: showConfirmFor === 'forEveryone' ? '#DC354515' : `${COLORS.accent}15` }}>
                                    {showConfirmFor === 'forEveryone' ? (
                                        <Trash2 className="w-5 h-5" style={{ color: '#DC3545' }} />
                                    ) : (
                                        <EyeOff className="w-5 h-5" style={{ color: COLORS.accent }} />
                                    )}
                                </div>
                                <p className="text-sm font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    {getTitle()}
                                </p>
                                <p className="text-xs mb-3" style={{ color: showConfirmFor === 'forEveryone' ? '#DC3545' : COLORS.accent }}>
                                    {showConfirmFor === 'forEveryone'
                                        ? "   Action irréversible !"
                                        : "   Le message disparaîtra uniquement pour vous"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowConfirmFor(null)}
                                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-gray-50"
                                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={showConfirmFor === 'forMe' ? handleDeleteForMe : handleDeleteForEveryone}
                                    className="flex-1 px-3 py-1.5 text-sm rounded-lg text-white transition-colors hover:opacity-90"
                                    style={{ backgroundColor: '#DC3545' }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;