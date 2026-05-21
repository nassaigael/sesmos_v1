import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Moon, Lock, Shield, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientSettings: React.FC = () => {
    const { clientData } = useClientAuth();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        maintenanceReminders: true,
        promotionalOffers: false,
        securityAlerts: true
    });

    const [appearance, setAppearance] = useState({
        theme: 'light',
        compactMode: false,
        animations: true
    });

    const [language, setLanguage] = useState('fr');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem('client_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.notifications) setNotifications(settings.notifications);
                if (settings.appearance) setAppearance(settings.appearance);
                if (settings.language) setLanguage(settings.language);
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }, []);

    const showSuccess = (message: string) => {
        setShowSuccessMessage(message);
        setTimeout(() => setShowSuccessMessage(null), 3000);
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            const settings = { notifications, appearance, language };
            localStorage.setItem('client_settings', JSON.stringify(settings));
            await new Promise(resolve => setTimeout(resolve, 500));
            showSuccess('Préférences de notification enregistrées');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAppearance = async () => {
        setLoading(true);
        try {
            const settings = { notifications, appearance, language };
            localStorage.setItem('client_settings', JSON.stringify(settings));

            if (appearance.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            showSuccess('Préférences d\'apparence enregistrées');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };


    const handleRequestAccountDeletion = () => {
        toast.success('Demande de suppression envoyée. Un administrateur vous contactera.');
        setShowDeleteConfirm(false);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
            <main className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Paramètres</h1>
                    <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Gérez vos préférences et configurations
                    </p>
                </div>

                {showSuccessMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 rounded-lg flex items-center justify-between"
                        style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">{showSuccessMessage}</span>
                        </div>
                        <button onClick={() => setShowSuccessMessage(null)}>
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                <div className="space-y-6">
                    {/* Section Notifications */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                        <div className="p-5 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <Bell className="w-5 h-5" style={{ color: COLORS.accent }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold" style={{ color: COLORS.primary }}>Notifications</h2>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Gérez vos alertes et notifications</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Alertes email</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Recevoir des notifications par email</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: notifications.emailAlerts ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Rappels de maintenance</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Être notifié avant une maintenance prévue</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, maintenanceReminders: !notifications.maintenanceReminders })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: notifications.maintenanceReminders ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.maintenanceReminders ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Offres promotionnelles</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Recevoir les offres et nouveautés</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, promotionalOffers: !notifications.promotionalOffers })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: notifications.promotionalOffers ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.promotionalOffers ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Alertes de sécurité</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Connexions suspectes et modifications</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: notifications.securityAlerts ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end" style={{ borderColor: COLORS.border }}>
                            <button
                                onClick={handleSaveNotifications}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                        <div className="p-5 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <Moon className="w-5 h-5" style={{ color: COLORS.accent }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold" style={{ color: COLORS.primary }}>Apparence</h2>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Personnalisez l'affichage de l'application</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary }}>Thème</label>
                                <div className="flex gap-3">
                                    {['light', 'dark', 'system'].map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => setAppearance({ ...appearance, theme })}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${appearance.theme === theme
                                                    ? 'text-white'
                                                    : 'border hover:bg-gray-50'
                                                }`}
                                            style={appearance.theme === theme
                                                ? { backgroundColor: COLORS.accent, color: COLORS.primary }
                                                : { borderColor: COLORS.border, color: COLORS.primary }
                                            }
                                        >
                                            {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mode compact</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Réduire les espaces pour plus de contenu</p>
                                </div>
                                <button
                                    onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: appearance.compactMode ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearance.compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Animations</p>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Activer les animations et transitions</p>
                                </div>
                                <button
                                    onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    style={{ backgroundColor: appearance.animations ? COLORS.accent : '#CBD5E1' }}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearance.animations ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end" style={{ borderColor: COLORS.border }}>
                            <button
                                onClick={handleSaveAppearance}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                        <div className="p-5 border-b" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.accent}15` }}>
                                    <Shield className="w-5 h-5" style={{ color: COLORS.accent }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold" style={{ color: COLORS.primary }}>Sécurité du compte</h2>
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Gérez la sécurité de votre compte</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Email connecté</p>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{user?.email}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                                        Vérifié
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Entreprise associée</p>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{clientData?.companyName}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}>
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: `${COLORS.primary}5` }}>
                                <div className="flex items-start gap-2">
                                    <Lock className="w-4 h-4 mt-0.5" style={{ color: COLORS.accent }} />
                                    <div>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                            Pour modifier votre mot de passe, rendez-vous dans l'onglet "Sécurité" de votre profil.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Danger - Suppression compte */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#DC354520' }}>
                        <div className="p-5 border-b" style={{ borderColor: '#DC354520' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DC354515' }}>
                                    <AlertTriangle className="w-5 h-5" style={{ color: '#DC3545' }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold" style={{ color: '#DC3545' }}>Zone dangereuse</h2>
                                    <p className="text-xs" style={{ color: '#DC3545', opacity: 0.7 }}>Actions irréversibles</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <p className="text-sm mb-4" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                La suppression de votre compte entraînera la perte définitive de toutes vos données.
                                Cette action est irréversible.
                            </p>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                    style={{ backgroundColor: '#DC3545', color: 'white' }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Demander la suppression du compte
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium" style={{ color: '#DC3545' }}>
                                        Êtes-vous sûr de vouloir supprimer votre compte ?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                                            style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleRequestAccountDeletion}
                                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                            style={{ backgroundColor: '#DC3545', color: 'white' }}
                                        >
                                            Confirmer la demande
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-6 text-center">
                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.4 }}>
                        Version 1.0.0 | © 2026 SESMOS - Smart Equipment & Sales
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ClientSettings;