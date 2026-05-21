import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, FileText, CreditCard, Edit, Clock, CheckCircle, XCircle, UserPlus, Key, ExternalLink } from 'lucide-react';
import type { Client, ClientUserResponse } from '../../types/client.types';
import clientService from '../../services/clientService';
import { useNavigate } from 'react-router-dom';

interface ClientDetailProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onEdit?: () => void;
    onRefresh?: () => void;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const ClientDetail: React.FC<ClientDetailProps> = ({ isOpen, onClose, client, onEdit, onRefresh }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [refreshData, setRefreshData] = useState(client);
    const [existingUser, setExistingUser] = useState<ClientUserResponse | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const loadFreshData = async () => {
            try {
                const freshClient = await clientService.getClientById(client.id);
                setRefreshData(freshClient);
            } catch (error) {
                console.error('Error refreshing client data:', error);
            }
        };
        if (isOpen && client.id) {
            loadFreshData();
        }
    }, [isOpen, client.id]);

    useEffect(() => {
        const loadExistingUser = async () => {
            if (isOpen && client.id) {
                setLoadingUser(true);
                try {
                    const user = await clientService.getUserForClient(client.id);
                    setExistingUser(user);
                } catch (error) {
                    console.error('Error loading user:', error);
                } finally {
                    setLoadingUser(false);
                }
            }
        };
        loadExistingUser();
    }, [isOpen, client.id]);

    const handleCreateUser = async () => {
        if (!userForm.name.trim()) {
            setUserError('Le nom est requis');
            return;
        }
        if (!userForm.email.trim()) {
            setUserError('L\'email est requis');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userForm.email)) {
            setUserError('Format d\'email invalide');
            return;
        }
        if (!userForm.password) {
            setUserError('Le mot de passe est requis');
            return;
        }
        if (userForm.password.length < 6) {
            setUserError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        if (userForm.password !== userForm.confirmPassword) {
            setUserError('Les mots de passe ne correspondent pas');
            return;
        }

        setCreatingUser(true);
        setUserError(null);

        try {
            const newUser = await clientService.createUserForClient(client.id, {
                name: userForm.name,
                email: userForm.email,
                password: userForm.password
            });
            setExistingUser(newUser);
            setShowCreateUserModal(false);
            setUserForm({ name: '', email: '', password: '', confirmPassword: '' });
            if (onRefresh) onRefresh();
        } catch (err: any) {
            setUserError(err.response?.data?.message || 'Erreur lors de la création du compte');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleGoToUserProfile = () => {
        if (existingUser && existingUser.id) {
            navigate('/users', { state: { selectedUserId: existingUser.id } });
            onClose();
        }
    };

    if (!isOpen) return null;

    const data = refreshData;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.4)' }} onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-6 pt-6 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <Building2 className="w-5 h-5" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-xl">Détail du client</h2>
                                        <p className="text-white/60 text-sm">Informations complètes et statistiques</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!existingUser && !loadingUser && (
                                        <button
                                            onClick={() => setShowCreateUserModal(true)}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                                            title="Créer un compte utilisateur"
                                        >
                                            <UserPlus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={onEdit}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                                        >
                                            <Edit className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                                    >
                                        <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="relative">
                                {data.logoUrl && !imageError ? (
                                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                        <img
                                            src={data.logoUrl}
                                            alt={data.companyName}
                                            className="w-full h-full object-cover object-center"
                                            onError={() => setImageError(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl" style={{ backgroundColor: COLORS.primary }}>
                                        {data.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-3 border-white shadow-md" style={{ backgroundColor: COLORS.accent }}>
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{data.companyName}</h3>
                                        <p className="text-sm mt-1 flex items-center justify-center md:justify-start gap-2" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                            <User className="w-3.5 h-3.5" />
                                            {data.contactName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {existingUser && (
                                            <button
                                                onClick={handleGoToUserProfile}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 group"
                                                style={{ backgroundColor: `${COLORS.accent}20`, color: COLORS.accent }}
                                            >
                                                <Key className="w-3 h-3" />
                                                <span>Compte existant</span>
                                                <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                                            </button>
                                        )}
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium self-center md:self-auto ${data.active ? 'animate-pulse' : ''}`} style={{ backgroundColor: data.active ? `${COLORS.accent}15` : 'rgba(0,0,0,0.05)', color: data.active ? COLORS.accent : COLORS.primary, opacity: data.active ? 1 : 0.6 }}>
                                            {data.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            {data.active ? 'Client actif' : 'Client inactif'}
                                        </div>
                                    </div>
                                </div>

                                {existingUser && (
                                    <div
                                        onClick={handleGoToUserProfile}
                                        className="mt-4 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md group"
                                        style={{ backgroundColor: COLORS.borderLight }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 flex items-center justify-center" style={{ borderColor: COLORS.accent }}>
                                                    {existingUser.imageUrl ? (
                                                        <img
                                                            src={existingUser.imageUrl}
                                                            alt={existingUser.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: COLORS.primary }}>
                                                            {getInitials(existingUser.name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold flex items-center gap-1" style={{ color: COLORS.primary }}>
                                                    {existingUser.name}
                                                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </p>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{existingUser.email}</p>
                                            </div>
                                            <div className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                                                {existingUser.role}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Coordonnées
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Mail className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Email</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Phone className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Téléphone</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Informations générales
                                </h4>
                                <div className="space-y-3">
                                    {data.address && (
                                        <div className="flex items-start gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <MapPin className="w-4 h-4" style={{ color: COLORS.accent }} />
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Adresse</p>
                                                <p className="text-sm font-medium" style={{ color: COLORS.primary }}>{data.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.borderLight }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                            <Clock className="w-4 h-4" style={{ color: COLORS.accent }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Membre depuis</p>
                                            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                                {new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(data.taxId || data.vatNumber) && (
                            <div className="mb-8 p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${COLORS.borderLight} 0%, transparent 100%)` }}>
                                <div className="flex flex-wrap gap-4">
                                    {data.taxId && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <FileText className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                            </div>
                                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>NIF:</span>
                                            <span className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{data.taxId}</span>
                                        </div>
                                    )}
                                    {data.vatNumber && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}20` }}>
                                                <CreditCard className="w-3.5 h-3.5" style={{ color: COLORS.accent }} />
                                            </div>
                                            <span className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>N° TVA:</span>
                                            <span className="text-sm font-mono font-medium" style={{ color: COLORS.primary }}>{data.vatNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6" style={{ borderColor: COLORS.border }}>
                            <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                                Statistiques
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {(data.totalRevenue ? data.totalRevenue.toLocaleString() : '0')} Ar
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Chiffre d'affaires</p>
                                </div>
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {data.totalSales || 0}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Ventes</p>
                                </div>
                                <div className="group p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.borderLight }}>
                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                        {data.activeEquipments || 0}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>Équipements actifs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showCreateUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(26, 60, 94, 0.4)' }} onClick={() => setShowCreateUserModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <UserPlus className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold" style={{ color: COLORS.primary }}>Créer un compte client</h3>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Pour {data.companyName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateUserModal(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {userError && (
                                <div className="p-2 rounded-lg text-xs text-center" style={{ backgroundColor: 'rgba(220,53,69,0.1)', color: '#DC3545' }}>
                                    {userError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>Nom complet</label>
                                <input
                                    type="text"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    placeholder="Jean Dupont"
                                    onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>Email (login)</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    placeholder="client@entreprise.com"
                                    onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>Mot de passe</label>
                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    placeholder="••••••"
                                    onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary }}>Confirmer mot de passe</label>
                                <input
                                    type="password"
                                    value={userForm.confirmPassword}
                                    onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    placeholder="••••••"
                                    onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 pt-0">
                            <button
                                onClick={() => setShowCreateUserModal(false)}
                                className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-all"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={creatingUser}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                            >
                                {creatingUser ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Créer le compte
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetail;