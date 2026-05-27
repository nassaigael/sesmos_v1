import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeOff, Trash2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';
import chatService from '../../services/chatService';

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

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onMessageUpdate }) => {
    const { user } = useAuth();
    const isOwn = message.user?.id === user?.id;
    const [showConfirmFor, setShowConfirmFor] = useState<'forMe' | 'forEveryone' | null>(null);

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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

    const isDeleted = message.deletedForEveryone || message.deleted;
    const content = isDeleted ? 'Message supprimé' : message.content;

    if (isDeleted) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className="rounded-2xl px-3 py-2 bg-gray-100 text-gray-500 italic text-sm">
                        🗑️ {content}
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
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
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
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">{content}</p>
                    {message.edited && (
                        <span className="text-xs italic mt-1 block" style={{ color: isOwn ? COLORS.primary : COLORS.white, opacity: 0.5 }}>
                            (modifié)
                        </span>
                    )}
                </div>

                <div className={`flex items-center gap-2 text-xs mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span style={{ color: COLORS.primary, opacity: 0.4 }}>
                        {formatTime(message.createdAt)}
                    </span>
                </div>

                {isOwn && (
                    <div className="flex gap-1 mt-1 justify-end">
                        <button
                            onClick={() => setShowConfirmFor('forMe')}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Supprimer pour moi"
                        >
                            <EyeOff className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        </button>
                        <button
                            onClick={() => setShowConfirmFor('forEveryone')}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                            title="Supprimer pour tout le monde"
                        >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#DC3545', opacity: 0.5 }} />
                        </button>
                    </div>
                )}

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