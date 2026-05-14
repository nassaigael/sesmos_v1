// types/user.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
    imageUrl?: string;
    accountNonLocked: boolean;
    createdAt: string;
}

export interface UserRequest {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
    imageUrl?: string;
}

export interface UserFilters {
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
    status?: 'active' | 'locked';
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
    byRole: {
        ADMIN: number;
        MANAGER: number;
        TECHNICIAN: number;
    };
}