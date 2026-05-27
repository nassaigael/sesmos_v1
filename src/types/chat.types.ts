export interface ChatMessage {
    id: string;
    content: string;
    roomId: string;
    user: {
        id: string;
        name: string;
        email: string;
        imageUrl?: string;
    };
    createdAt: string;
    updatedAt?: string;
    edited?: boolean;
    deletedForEveryone?: boolean;
    deleted?: boolean;
    attachments?: Attachment[];
    reactions?: Reaction[];
    mentions?: Mention[];
}

export interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export interface Reaction {
    type: string;
    userId: string;
    userName: string;
}

export interface Mention {
    type: 'USER' | 'EQUIPMENT' | 'PRODUCT';
    id: string;
    name: string;
}

export interface ChatRoom {
    id: string;
    name: string;
    type: string;
    participants: string[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageRequest {
    content: string;
    roomId: string;
    mentions?: Mention[];
}

export interface TypingIndicator {
    roomId: string;
    userId: string;
    userName: string;
    typing: boolean;
}

export interface SearchResult {
    id: string;
    name: string;
    type: 'USER' | 'EQUIPMENT' | 'PRODUCT';
    subtitle?: string;
    imageUrl?: string;
    email?: string;
    role?: string;
    serialNumber?: string;
    status?: string;
    clientName?: string;
    category?: string;
    price?: number;
}