import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Package, Wrench, Search, Plus } from 'lucide-react';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatRoom } from '../../types/chat.types';

interface ChatRoomListProps {
    selectedRoomId: string | null;
    onSelectRoom: (room: ChatRoom) => void;
    onCreateRoom: () => void;
    isOpen?: boolean;
    onClose?: () => void;
    isMobile?: boolean;
}

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    white: '#FFFFFF'
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

const getRoomIcon = (type: string) => {
    switch (type) {
        case 'GENERAL': return <Users className="w-4 h-4" />;
        case 'PRIVATE': return <MessageSquare className="w-4 h-4" />;
        case 'EQUIPMENT': return <Wrench className="w-4 h-4" />;
        case 'PRODUCT': return <Package className="w-4 h-4" />;
        default: return <MessageSquare className="w-4 h-4" />;
    }
};

const ChatRoomList: React.FC<ChatRoomListProps> = ({
    selectedRoomId,
    onSelectRoom,
    onCreateRoom,
    isOpen = true,
    onClose,
    isMobile = false
}) => {
    const { user: currentUser } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [otherUsers, setOtherUsers] = useState<Map<string, any>>(new Map());
    const [imageErrors, setImageErrors] = useState<Map<string, boolean>>(new Map());

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        setLoading(true);
        try {
            const data = await chatService.getUserRooms();
            setRooms(data);
            await loadOtherUsers(data);
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOtherUsers = async (roomsList: ChatRoom[]) => {
        const privateRooms = roomsList.filter(room => room.type === 'PRIVATE');
        const allUsers = await chatService.getAvailableUsers();
        const usersMap = new Map();
        allUsers.forEach(u => usersMap.set(u.id, u));

        const otherUsersMap = new Map();
        privateRooms.forEach(room => {
            const otherId = room.participants?.find(p => p !== currentUser?.id);
            if (otherId && usersMap.has(otherId)) {
                otherUsersMap.set(room.id, usersMap.get(otherId));
            }
        });
        setOtherUsers(otherUsersMap);
    };

    const handleImageError = (roomId: string) => {
        setImageErrors(prev => new Map(prev).set(roomId, true));
    };

    const getDisplayName = (room: ChatRoom) => {
        if (room.type !== 'PRIVATE') return room.name;
        const otherUser = otherUsers.get(room.id);
        if (otherUser) return otherUser.name;
        const otherId = room.participants?.find(p => p !== currentUser?.id);
        if (otherId) {
            const nameParts = room.name.split(' - ');
            const firstName = nameParts[0];
            const secondName = nameParts[1] || nameParts[0];
            if (firstName === currentUser?.name) {
                return secondName;
            }
            return firstName;
        }
        return room.name || 'Conversation';
    };

    const getOtherUserRole = (room: ChatRoom) => {
        if (room.type !== 'PRIVATE') return null;
        const otherUser = otherUsers.get(room.id);
        return otherUser?.role || null;
    };

    const getOtherUserImage = (room: ChatRoom) => {
        if (room.type !== 'PRIVATE') return null;
        const otherUser = otherUsers.get(room.id);
        return otherUser?.imageUrl || null;
    };

    const filteredRooms = rooms.filter(room =>
        getDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectRoom = (room: ChatRoom) => {
        onSelectRoom(room);
        if (isMobile && onClose) {
            onClose();
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-3 border-b animate-pulse" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    flex flex-col bg-white h-full transition-transform duration-300 ease-in-out
                    ${isMobile ? 'fixed top-0 left-0 w-80 z-50 shadow-xl' : 'w-full'}
                    ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
                `}
                style={{ borderColor: COLORS.border }}
            >
                <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg" style={{ color: COLORS.primary }}>Conversations</h2>
                        <button
                            onClick={onCreateRoom}
                            className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                            title="Nouvelle conversation"
                        >
                            <Plus className="w-4 h-4" style={{ color: COLORS.accent }} />
                        </button>
                    </div>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                        <input
                            type="text"
                            placeholder="Rechercher une conversation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ borderColor: COLORS.border }}
                            onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                            onBlur={(e) => e.target.style.borderColor = COLORS.border}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredRooms.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                <MessageSquare className="w-8 h-8" style={{ color: COLORS.accent, opacity: 0.6 }} />
                            </div>
                            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>Aucune conversation</p>
                            <button
                                onClick={onCreateRoom}
                                className="mt-3 text-sm hover:underline"
                                style={{ color: COLORS.accent }}
                            >
                                Créer une nouvelle conversation
                            </button>
                        </div>
                    ) : (
                        filteredRooms.map((room) => {
                            const isActive = selectedRoomId === room.id;
                            const displayName = getDisplayName(room);
                            const otherUserRole = getOtherUserRole(room);
                            const otherUserImage = getOtherUserImage(room);
                            const hasImageError = imageErrors.get(room.id);
                            const roleColor = getRoleColor(otherUserRole);

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => handleSelectRoom(room)}
                                    className={`w-full p-3 border-b text-left transition-all hover:bg-gray-50 ${isActive ? 'bg-yellow-50' : ''
                                        }`}
                                    style={{ borderColor: COLORS.border }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0">
                                            {room.type === 'PRIVATE' && otherUserImage && !hasImageError ? (
                                                <img
                                                    src={otherUserImage}
                                                    alt={displayName}
                                                    className="w-10 h-10 rounded-full object-cover border-2"
                                                    style={{ borderColor: COLORS.accent }}
                                                    onError={() => handleImageError(room.id)}
                                                />
                                            ) : room.type === 'PRIVATE' ? (
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                    style={{ backgroundColor: roleColor }}
                                                >
                                                    {getInitials(displayName)}
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: `${COLORS.accent}15` }}
                                                >
                                                    {getRoomIcon(room.type)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-medium text-sm truncate" style={{ color: COLORS.primary }}>
                                                    {displayName}
                                                </p>
                                                {room.unreadCount > 0 && (
                                                    <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white shrink-0"
                                                        style={{ backgroundColor: COLORS.accent }}>
                                                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            {room.lastMessage && (
                                                <p className="text-xs truncate mt-0.5" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                    {room.lastMessage.user?.name}: {room.lastMessage.content.substring(0, 50)}
                                                </p>
                                            )}
                                            {!room.lastMessage && (
                                                <p className="text-xs truncate mt-0.5" style={{ color: COLORS.primary, opacity: 0.3 }}>
                                                    Aucun message
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatRoomList;