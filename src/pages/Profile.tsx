// pages/Profile.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    User, Mail, Shield, ShieldAlert, ShieldCheck, Camera,
    Lock, Eye, EyeOff, Save, RefreshCw, Trash2, CheckCircle
} from 'lucide-react';
import userService from '../services/userService';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

interface ProfileForm {
    name: string;
    email: string;
    role: string;
}

interface PasswordForm {
    newPassword: string;
    confirmPassword: string;
}

const getRoleColor = (role?: string) => {
    switch (role) {
        case 'ADMIN': return '#DC3545';
        case 'MANAGER': return '#F5A623';
        case 'TECHNICIAN': return '#28A745';
        default: return 'var(--color-primary)';
    }
};

const getRoleLabel = (role?: string) => {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'MANAGER': return 'Manager';
        case 'TECHNICIAN': return 'Technicien';
        default: return role || 'Utilisateur';
    }
};

const getRoleIcon = (role?: string) => {
    switch (role) {
        case 'ADMIN': return <ShieldAlert className="w-5 h-5" />;
        case 'MANAGER': return <Shield className="w-5 h-5" />;
        case 'TECHNICIAN': return <ShieldCheck className="w-5 h-5" />;
        default: return <User className="w-5 h-5" />;
    }
};

const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const Profile: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const { user, login } = useAuth();

    const [profileForm, setProfileForm] = useState<ProfileForm>({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
    });
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.imageUrl || null);
    const [imageError, setImageError] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '', email: user.email || '', role: user.role || '' });
            setAvatarPreview(user.imageUrl || null);
        }
    }, [user]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image valide');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('L\'image ne doit pas dépasser 5 Mo');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setIsUploadingAvatar(true);
        try {
            const imageUrl = await userService.uploadAvatar(file, user?.id);
            toast.success('Avatar mis à jour avec succès');
            setAvatarPreview(imageUrl);
            setImageError(false);
        } catch {
            toast.error('Erreur lors de l\'upload de l\'avatar');
            setAvatarPreview(user?.imageUrl || null);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profileForm.name.trim()) {
            toast.error('Le nom est obligatoire');
            return;
        }
        if (!user?.id) return;

        setIsSavingProfile(true);
        try {
            await userService.updateUser(user.id, {
                name: profileForm.name,
                email: profileForm.email,
                role: profileForm.role as any,
                password: '', // non modifié
                imageUrl: avatarPreview || undefined,
            });
            toast.success('Profil mis à jour avec succès');
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSavePassword = async () => {
        if (!passwordForm.newPassword) {
            toast.error('Le nouveau mot de passe est obligatoire');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (!user?.id) return;

        setIsSavingPassword(true);
        try {
            await userService.resetPassword(user.id, passwordForm.newPassword);
            toast.success('Mot de passe mis à jour avec succès');
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user?.id) return;
        try {
            await userService.updateUser(user.id, {
                name: profileForm.name,
                email: profileForm.email,
                role: profileForm.role as any,
                password: '',
                imageUrl: undefined,
            });
            setAvatarPreview(null);
            setImageError(false);
            toast.success('Avatar supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const passwordStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = passwordStrength(passwordForm.newPassword);
    const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const strengthColors = ['', '#DC3545', '#FFC107', '#28A745', '#1A3C5E'];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="profile"
            />

            <main className="p-4 md:p-6 max-w-4xl mx-auto">
                {/* Profile Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    {/* Banner */}
                    <div className="h-28 relative" style={{ background: `linear-gradient(135deg, var(--color-primary) 0%, #2a5a8e 100%)` }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md"
                                    style={{ backgroundColor: getRoleColor(user?.role) }}>
                                    {avatarPreview && !imageError ? (
                                        <img src={avatarPreview} alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={() => setImageError(true)} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </div>
                                    )}
                                </div>

                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg text-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                                    style={{ backgroundColor: 'var(--color-accent)' }}>
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*"
                                    onChange={handleAvatarChange} className="hidden" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 mt-2 sm:mt-0 sm:mb-2">
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-secondary)' }}>
                                    {user?.name || 'Utilisateur'}
                                </h2>
                                <p className="text-sm opacity-60 mt-0.5" style={{ color: 'var(--color-text)' }}>
                                    {user?.email}
                                </p>
                                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: `${getRoleColor(user?.role)}15`, color: getRoleColor(user?.role) }}>
                                    {getRoleIcon(user?.role)}
                                    {getRoleLabel(user?.role)}
                                </span>
                            </div>

                            {avatarPreview && (
                                <button onClick={handleRemoveAvatar}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-50"
                                    style={{ color: 'var(--color-danger)' }}>
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Supprimer photo</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border shadow-sm"
                    style={{ borderColor: 'var(--color-border)' }}>
                    {[
                        { key: 'info', label: 'Informations', icon: <User className="w-4 h-4" /> },
                        { key: 'security', label: 'Sécurité', icon: <Lock className="w-4 h-4" /> },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
                            style={activeTab === tab.key
                                ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                                : { color: 'var(--color-text)', opacity: 0.6 }}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: 'var(--color-border)' }}>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"
                                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-secondary)' }}>
                                <User className="w-5 h-5" />
                                Informations personnelles
                            </h3>

                            <div className="space-y-5">
                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                        Nom complet <span style={{ color: 'var(--color-danger)' }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                                            style={{ borderColor: 'var(--color-border)' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm opacity-60 cursor-not-allowed"
                                            style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,0,0,0.02)' }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 opacity-50" style={{ color: 'var(--color-text)' }}>
                                        L'email ne peut pas être modifié
                                    </p>
                                </div>

                                {/* Rôle */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                        Rôle
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border"
                                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                        <span style={{ color: getRoleColor(user?.role) }}>
                                            {getRoleIcon(user?.role)}
                                        </span>
                                        <span className="text-sm font-medium" style={{ color: getRoleColor(user?.role) }}>
                                            {getRoleLabel(user?.role)}
                                        </span>
                                        <span className="text-xs opacity-50 ml-auto" style={{ color: 'var(--color-text)' }}>
                                            Modifiable par un admin
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {isSavingProfile ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSavingProfile ? 'Enregistrement...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: 'var(--color-border)' }}>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"
                                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-secondary)' }}>
                                <Lock className="w-5 h-5" />
                                Changer le mot de passe
                            </h3>

                            <div className="space-y-5">
                                {/* Nouveau mot de passe */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                        Nouveau mot de passe <span style={{ color: 'var(--color-danger)' }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                                            style={{ borderColor: 'var(--color-border)' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                            placeholder="Nouveau mot de passe"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Force du mot de passe */}
                                    {passwordForm.newPassword && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                                                        style={{ backgroundColor: i <= strength ? strengthColors[strength] : 'var(--color-border)' }} />
                                                ))}
                                            </div>
                                            <p className="text-xs" style={{ color: strengthColors[strength] }}>
                                                {strengthLabels[strength]}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirmer */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                        Confirmer le mot de passe <span style={{ color: 'var(--color-danger)' }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                                            style={{ borderColor: passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? 'var(--color-danger)' : 'var(--color-border)' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                                            onBlur={e => e.target.style.borderColor = passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? 'var(--color-danger)' : 'var(--color-border)'}
                                            placeholder="Confirmer le mot de passe"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        {passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword && (
                                            <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4"
                                                style={{ color: 'var(--color-success)' }} />
                                        )}
                                    </div>
                                    {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                                        <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                            Les mots de passe ne correspondent pas
                                        </p>
                                    )}
                                </div>

                                {/* Tips */}
                                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(26,60,94,0.04)', border: '1px solid var(--color-border)' }}>
                                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-primary)' }}>
                                        Conseils pour un mot de passe fort :
                                    </p>
                                    {[
                                        'Au moins 8 caractères',
                                        'Une lettre majuscule',
                                        'Un chiffre',
                                        'Un caractère spécial (!@#$...)'
                                    ].map((tip, i) => (
                                        <p key={i} className="text-xs opacity-60 flex items-center gap-2 mt-1" style={{ color: 'var(--color-text)' }}>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSavingPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {isSavingPassword ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    {isSavingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default Profile;