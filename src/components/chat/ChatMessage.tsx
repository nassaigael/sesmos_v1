import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';

interface ChatMessageProps {
    message: ChatMessageType;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const { user } = useAuth();
    const isOwn = message.user?.id === user?.id;

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderContentWithMentions = () => {
        if (!message.mentions || message.mentions.length === 0) {
            return <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>;
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

        return <div className="text-sm whitespace-pre-wrap wrap-break-word" dangerouslySetInnerHTML={{ __html: content }} />;
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
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
                    className={`rounded-2xl px-3 py-2 ${isOwn ? 'text-white' : 'border'}`}
                    style={
                        isOwn
                            ? { backgroundColor: COLORS.accent, color: COLORS.primary }
                            : { borderColor: COLORS.border, backgroundColor: COLORS.white }
                    }
                >
                    {renderContentWithMentions()}
                </div>
                <div className={`text-xs mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`} style={{ color: COLORS.primary, opacity: 0.4 }}>
                    {formatTime(message.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;