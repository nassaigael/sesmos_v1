import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MentionSuggestions from './MentionSuggestions';
import type { SearchResult } from '../../types/chat.types';

interface ChatInputProps {
    onSendMessage: (content: string, mentions: any[]) => void;
    onTyping: (isTyping: boolean) => void;
    disabled?: boolean;
    isConnected?: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onTyping,
    disabled,
    isConnected = true
}) => {
    const [message, setMessage] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentions, setMentions] = useState<any[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
                setShowMentions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

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
                const rect = textareaRef.current?.getBoundingClientRect();
                if (rect) {
                    setMentionPosition({ top: rect.top, left: rect.left });
                }
                return;
            }
        }
        setShowMentions(false);
    };

    const handleSelectMention = (item: SearchResult) => {
        const textBeforeCursor = message.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = message.substring(cursorPosition);

        const newMessage = textBeforeCursor.substring(0, lastAtIndex) + `@${item.name} ` + textAfterCursor;

        setMessage(newMessage);
        setMentions([...mentions, {
            type: item.type,
            id: item.id,
            name: item.name
        }]);
        setShowMentions(false);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = lastAtIndex + item.name.length + 2;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message, mentions);
            setMessage('');
            setMentions([]);
            onTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Escape') {
            setShowMentions(false);
        }
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    return (
        <div className="relative">
            {showMentions && (
                <MentionSuggestions
                    query={mentionQuery}
                    position={mentionPosition}
                    onSelect={handleSelectMention}
                    onClose={() => setShowMentions(false)}
                />
            )}

            <div className="flex items-end gap-2 p-3 border-t" style={{ borderColor: COLORS.border }}>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isConnected ? "Tapez votre message... Utilisez @ pour mentionner" : "Connexion en cours..."}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: COLORS.border, maxHeight: '120px' }}
                    onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="p-2 rounded-lg transition-all shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ChatInput;