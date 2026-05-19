import React, { useState } from 'react';
import {
    Edit, Trash2, Lock, Unlock, Mail, Calendar, User, ShieldCheck, Wrench, Crown
} from 'lucide-react';
import type { User as UserType } from '../../types/user';

interface UserCardProps {
    user: UserType;
    onEdit: (user: UserType) => void;
    onDelete: (id: string) => void;
    onLock?: (id: string) => void;
    onUnlock?: (id: string) => void;
}

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    white: '#FFFFFF'
};

const ROLE_COLORS = {
    bg: COLORS.primary,
    light: `${COLORS.primary}10`,
    gradient: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'ADMIN':
            return <Crown className="w-4 h-4 text-white" />;
        case 'MANAGER':
            return <ShieldCheck className="w-4 h-4 text-white" />;
        case 'TECHNICIAN':
            return <Wrench className="w-4 h-4 text-white" />;
        default:
            return <User className="w-4 h-4 text-white" />;
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'MANAGER': return 'Manager';
        case 'TECHNICIAN': return 'Technicien';
        default: return role;
    }
};

const getStatusColor = (isActive: boolean) => {
    if (isActive) {
        return {
            bg: COLORS.accent,
            light: `${COLORS.accent}15`,
            text: '#8B6914'
        };
    }
    return {
        bg: COLORS.primary,
        light: `${COLORS.primary}15`,
        text: COLORS.primary
    };
};

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onLock, onUnlock }) => {
    const [imageError, setImageError] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isActive = user.accountNonLocked;
    const statusColor = getStatusColor(isActive);

    return (
        <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div
                className="relative h-24"
                style={{ background: ROLE_COLORS.gradient }}
            >
                <div className="absolute top-3 right-3">
                    <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        style={{
                            backgroundColor: isActive ? statusColor.bg : COLORS.primary,
                            color: 'white'
                        }}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: 'white' }} />
                        {isActive ? 'Actif' : 'Bloqué'}
                    </div>
                </div>
            </div>

            <div className="relative flex justify-center -mt-12">
                <div className="relative">
                    {user.imageUrl && !imageError ? (
                        <div
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center"
                            style={{ flexShrink: 0 }}
                        >
                            <img
                                src={user.imageUrl}
                                alt={user.name}
                                className="w-full h-full object-cover object-center"
                                style={{ objectPosition: 'center center' }}
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: COLORS.accent }}
                    >
                        {getRoleIcon(user.role)}
                    </div>
                </div>
            </div>

            <div className="p-4 pt-6">
                <div className="text-center mb-4">
                    <h3 className="font-bold text-lg" style={{ color: COLORS.primary }}>
                        {user.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <Mail className="w-3 h-3" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <p className="text-xs truncate max-w-45" style={{ color: COLORS.primary, opacity: 0.7 }}>
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="mb-4 p-2.5 rounded-xl text-center" style={{ backgroundColor: ROLE_COLORS.light }}>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-5 text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                    <Calendar className="w-3 h-3" />
                    <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                        onClick={() => onEdit(user)}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-gray-50"
                    >
                        <Edit className="w-4 h-4" style={{ color: COLORS.accent }} />
                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Modifier</span>
                    </button>

                    {!isActive ? (
                        <button
                            onClick={() => onUnlock?.(user.id)}
                            className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-gray-50"
                        >
                            <Unlock className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Débloquer</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onLock?.(user.id)}
                            className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-gray-50"
                        >
                            <Lock className="w-4 h-4" style={{ color: COLORS.accent }} />
                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Bloquer</span>
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(user.id)}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-gray-50"
                    >
                        <Trash2 className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.5 }} />
                        <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Supprimer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCard;