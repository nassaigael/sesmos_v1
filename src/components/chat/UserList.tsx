import React, { useState, useEffect } from 'react';
import { Search, User, MessageCircle, X } from 'lucide-react';
import chatService from '../../services/chatService';
import type { ChatRoom } from '../../types/chat.types';
import { useAuth } from '../../contexts/AuthContext';

interface UserListProps {
    onSelectUser: (userId: string, room: ChatRoom) => void;
    onClose: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
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

const UserList: React.FC<UserListProps> = ({ onSelectUser, onClose }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentChats, setRecentChats] = useState<ChatRoom[]>([]);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadUsers();
        loadRecentChats();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await chatService.getAvailableUsers();
            setUsers(response);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentChats = async () => {
        try {
            const rooms = await chatService.getUserRooms();
            setRecentChats(rooms.filter(room => room.type === 'PRIVATE'));
        } catch (error) {
            console.error('Error loading recent chats:', error);
        }
    };

    const handleSelectUser = async (selectedUser: any) => {
        try {
            const room = await chatService.getOrCreatePrivateChat(selectedUser.id);
            onSelectUser(selectedUser.id, room);
            onClose();
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const handleImageError = (userId: string) => {
        setImageErrors(prev => ({ ...prev, [userId]: true }));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRecentChatUser = (chat: ChatRoom) => {
        const otherId = chat.participants?.find(p => p !== currentUser?.id);
        return users.find(u => u.id === otherId);
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex-1 p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-lg" style={{ color: COLORS.primary }}>Nouvelle conversation</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
                    >
                        <X className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.5 }} />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: COLORS.border }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                </div>
            </div>

            {recentChats.length > 0 && (
                <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: COLORS.primary, opacity: 0.5 }}>Conversations récentes</p>
                    <div className="space-y-2">
                        {recentChats.slice(0, 3).map((chat) => {
                            const otherUser = getRecentChatUser(chat);
                            if (!otherUser) return null;
                            const hasImageError = imageErrors[otherUser.id];
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => handleSelectUser(otherUser)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 shrink-0">
                                        {otherUser.imageUrl && !hasImageError ? (
                                            <img
                                                src={otherUser.imageUrl}
                                                alt={otherUser.name}
                                                className="w-10 h-10 rounded-full object-cover border-2"
                                                style={{ borderColor: COLORS.accent }}
                                                onError={() => handleImageError(otherUser.id)}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                style={{ backgroundColor: COLORS.primary }}>
                                                {getInitials(otherUser.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>{otherUser.name}</p>
                                        <p className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>{otherUser.email}</p>
                                    </div>
                                    <MessageCircle className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.accent }} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: COLORS.primary, opacity: 0.5 }}>Tous les utilisateurs</p>
                <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <User className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.primary, opacity: 0.3 }} />
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucun utilisateur trouvé</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const hasImageError = imageErrors[user.id];
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 shrink-0">
                                        {user.imageUrl && !hasImageError ? (
                                            <img
                                                src={user.imageUrl}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover border-2"
                                                style={{ borderColor: COLORS.accent }}
                                                onError={() => handleImageError(user.id)}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                style={{ backgroundColor: COLORS.primary }}>
                                                {getInitials(user.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: COLORS.primary }}>{user.name}</p>
                                        <p className="text-xs truncate" style={{ color: COLORS.primary, opacity: 0.5 }}>{user.email}</p>
                                        <span className="text-xs inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${COLORS.accent}10`, color: COLORS.accent }}>
                                            <User className="w-3 h-3" />
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </div>
                                    <MessageCircle className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.accent }} />
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserList;