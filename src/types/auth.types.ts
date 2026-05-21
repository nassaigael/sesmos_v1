export interface StoredUser {
    id: string;
    name: string;
    email: string;
    role: string;
    type: string;
    expiration: number;
    imageUrl?: string;
    clientId?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    imageUrl?: string;
    clientId?: string;
    accountNonLocked: boolean;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: string;
    name: string;
    email: string;
    role: string;
    expiration: number;
    imageUrl?: string;
    clientId?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}