import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    User, Mail, Shield, ShieldAlert, ShieldCheck, Camera,
    Lock, Eye, EyeOff, Save, RefreshCw, Trash2, CheckCircle,
    Calendar} from 'lucide-react';
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
        default: return '#1A3C5E';
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
    const { user, refreshUser } = useAuth();

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

        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setIsUploadingAvatar(true);
        try {
            const imageUrl = await userService.uploadAvatar(file, user?.id);
            toast.success('Avatar mis à jour avec succès');
            setAvatarPreview(imageUrl);
            setImageError(false);
            await refreshUser();
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
            const updateData: any = {
                name: profileForm.name,
                email: profileForm.email,
                role: profileForm.role,
                password: null,
                imageUrl: avatarPreview || null,
            };

            await userService.updateUser(user.id, updateData);
            toast.success('Profil mis à jour avec succès');
            await refreshUser();
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
            const updateData: any = {
                name: profileForm.name,
                email: profileForm.email,
                role: profileForm.role,
                password: null,
                imageUrl: null,
            };
            await userService.updateUser(user.id, updateData);
            setAvatarPreview(null);
            setImageError(false);
            toast.success('Avatar supprimé');
            await refreshUser();
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
    const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const strengthColors = ['', '#DC3545', '#F5A623', '#FFC107', '#28A745', '#1A3C5E'];

    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="users"
            />

            <main className="p-4 md:p-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6"
                    style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}
                >
                    <div className="relative h-28" style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #2a5a8e 100%)' }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14">
                            <div className="relative shrink-0">
                                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white"
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
                                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl text-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                                    style={{ backgroundColor: '#FFC107' }}>
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*"
                                    onChange={handleAvatarChange} className="hidden" />
                            </div>

                            <div className="flex-1 mt-2 sm:mt-0">
                                <h1 className="text-2xl font-bold" style={{ color: '#1A3C5E', fontFamily: 'var(--font-secondary)' }}>
                                    {user?.name || 'Utilisateur'}
                                </h1>
                                <p className="text-sm mt-0.5" style={{ color: '#1A3C5E', opacity: 0.6 }}>
                                    {user?.email}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                                        style={{ backgroundColor: `${getRoleColor(user?.role)}15`, color: getRoleColor(user?.role) }}>
                                        {getRoleIcon(user?.role)}
                                        {getRoleLabel(user?.role)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#1A3C5E', opacity: 0.5 }}>
                                        <Calendar className="w-3.5 h-3.5" />
                                        Membre depuis {memberSince}
                                    </span>
                                </div>
                            </div>

                            {avatarPreview && (
                                <button onClick={handleRemoveAvatar}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-red-50"
                                    style={{ color: '#DC3545' }}>
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Supprimer photo</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border shadow-sm"
                    style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                    {[
                        { key: 'info', label: 'Informations personnelles', icon: <User className="w-4 h-4" /> },
                        { key: 'security', label: 'Sécurité et mot de passe', icon: <Lock className="w-4 h-4" /> },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                            style={activeTab === tab.key
                                ? { backgroundColor: '#1A3C5E', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                                : { color: '#1A3C5E', opacity: 0.6 }}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <div className="flex items-center gap-3 mb-6 pb-3 border-b" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                                    <User className="w-4 h-4" style={{ color: '#1A3C5E' }} />
                                </div>
                                <h3 className="text-lg font-semibold" style={{ color: '#1A3C5E' }}>
                                    Informations personnelles
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                            style={{ borderColor: 'rgba(26, 60, 94, 0.2)' }}
                                            onFocus={e => e.target.style.borderColor = '#FFC107'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(26, 60, 94, 0.2)'}
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-gray-50 cursor-not-allowed"
                                            style={{ borderColor: 'rgba(26, 60, 94, 0.2)', backgroundColor: '#F9FAFB' }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: '#1A3C5E', opacity: 0.5 }}>
                                        L'email ne peut pas être modifié
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                        Rôle
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border"
                                        style={{ borderColor: 'rgba(26, 60, 94, 0.2)', backgroundColor: '#F9FAFB' }}>
                                        <span style={{ color: getRoleColor(user?.role) }}>
                                            {getRoleIcon(user?.role)}
                                        </span>
                                        <span className="text-sm font-medium" style={{ color: getRoleColor(user?.role) }}>
                                            {getRoleLabel(user?.role)}
                                        </span>
                                        <span className="text-xs ml-auto" style={{ color: '#1A3C5E', opacity: 0.5 }}>
                                            Modifiable par un administrateur
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                    style={{ backgroundColor: '#1A3C5E' }}>
                                    {isSavingProfile ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSavingProfile ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                            <div className="flex items-center gap-3 mb-6 pb-3 border-b" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                                    <Lock className="w-4 h-4" style={{ color: '#1A3C5E' }} />
                                </div>
                                <h3 className="text-lg font-semibold" style={{ color: '#1A3C5E' }}>
                                    Changer le mot de passe
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                        Nouveau mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                            style={{ borderColor: 'rgba(26, 60, 94, 0.2)' }}
                                            onFocus={e => e.target.style.borderColor = '#FFC107'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(26, 60, 94, 0.2)'}
                                            placeholder="Nouveau mot de passe"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {passwordForm.newPassword && (
                                        <div className="mt-3">
                                            <div className="flex gap-1 mb-1.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                        style={{ backgroundColor: i <= strength ? strengthColors[strength] : 'rgba(26, 60, 94, 0.1)' }} />
                                                ))}
                                            </div>
                                            <p className="text-xs" style={{ color: strengthColors[strength] }}>
                                                {strengthLabels[strength]}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                        Confirmer le mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                            style={{ borderColor: passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? '#DC3545' : 'rgba(26, 60, 94, 0.2)' }}
                                            onFocus={e => e.target.style.borderColor = '#FFC107'}
                                            onBlur={e => e.target.style.borderColor = passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? '#DC3545' : 'rgba(26, 60, 94, 0.2)'}
                                            placeholder="Confirmer le mot de passe"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        {passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword && (
                                            <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#28A745' }} />
                                        )}
                                    </div>
                                    {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                                        <p className="text-xs mt-1" style={{ color: '#DC3545' }}>
                                            Les mots de passe ne correspondent pas
                                        </p>
                                    )}
                                </div>

                                <div className="p-4 rounded-xl mt-2" style={{ backgroundColor: 'rgba(26, 60, 94, 0.04)', border: '1px solid rgba(26, 60, 94, 0.1)' }}>
                                    <p className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#1A3C5E' }}>
                                        <Shield className="w-3.5 h-3.5" />
                                        Conseils pour un mot de passe fort :
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {[
                                            '✓ Au moins 8 caractères',
                                            '✓ Une lettre majuscule',
                                            '✓ Un chiffre',
                                            '✓ Un caractère spécial (!@#$...)'
                                        ].map((tip, i) => (
                                            <p key={i} className="text-xs" style={{ color: '#1A3C5E', opacity: 0.6 }}>
                                                {tip}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSavingPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    style={{ backgroundColor: '#1A3C5E' }}>
                                    {isSavingPassword ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    {isSavingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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