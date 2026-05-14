// pages/Settings.tsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import toast from 'react-hot-toast';
import {
    Globe, Bell, Shield, Database, Palette,
    Save, RefreshCw, ChevronRight, CheckCircle, Info
} from 'lucide-react';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

interface AppSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: {
        email: boolean;
        saleAlert: boolean;
        stockCritical: boolean;
        equipmentDown: boolean;
        maintenanceUpdate: boolean;
    };
    display: {
        theme: string;
        density: string;
        itemsPerPage: number;
    };
    security: {
        sessionTimeout: number;
        twoFactor: boolean;
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    language: 'fr',
    timezone: 'Indian/Antananarivo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'MGA',
    notifications: {
        email: true,
        saleAlert: true,
        stockCritical: true,
        equipmentDown: true,
        maintenanceUpdate: false,
    },
    display: {
        theme: 'light',
        density: 'comfortable',
        itemsPerPage: 10,
    },
    security: {
        sessionTimeout: 60,
        twoFactor: false,
    },
};

const SECTIONS = [
    { key: 'general', label: 'Général', icon: <Globe className="w-5 h-5" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { key: 'display', label: 'Affichage', icon: <Palette className="w-5 h-5" /> },
    { key: 'security', label: 'Sécurité', icon: <Shield className="w-5 h-5" /> },
    { key: 'data', label: 'Données', icon: <Database className="w-5 h-5" /> },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
        style={{ backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)' }}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const Settings: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('appSettings');
        if (saved) { try { return JSON.parse(saved); } catch { } }
        return DEFAULT_SETTINGS;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [savedIndicator, setSavedIndicator] = useState(false);

    const updateSettings = (path: string[], value: any) => {
        setSettings(prev => {
            const updated = { ...prev };
            let obj: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                obj[path[i]] = { ...obj[path[i]] };
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            return updated;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise(r => setTimeout(r, 600));
            localStorage.setItem('appSettings', JSON.stringify(settings));
            setSavedIndicator(true);
            toast.success('Paramètres sauvegardés');
            setTimeout(() => setSavedIndicator(false), 3000);
        } catch {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        toast('Paramètres réinitialisés');
    };

    const SectionCard: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'rgba(26,60,94,0.02)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-secondary)' }}>{title}</h3>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    );

    const SettingRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                {description && <p className="text-xs mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>{description}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );

    const selectClass = "px-3 py-2 text-sm rounded-lg border focus:outline-none transition-all";
    const selectStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="settings"
            />

            <main className="p-4 md:p-6">
                <div className="max-w-5xl mx-auto flex gap-6">
                    {/* Sidebar nav */}
                    <div className="hidden md:block w-56 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden sticky top-24"
                            style={{ borderColor: 'var(--color-border)' }}>
                            {SECTIONS.map(s => (
                                <button key={s.key} onClick={() => setActiveSection(s.key)}
                                    className="w-full flex items-center justify-between px-4 py-3 transition-all hover:bg-gray-50 border-b last:border-b-0"
                                    style={{
                                        borderColor: 'var(--color-border)',
                                        backgroundColor: activeSection === s.key ? 'rgba(26,60,94,0.06)' : undefined,
                                        color: activeSection === s.key ? 'var(--color-primary)' : 'var(--color-text)'
                                    }}>
                                    <div className="flex items-center gap-3">
                                        <span style={{ opacity: activeSection === s.key ? 1 : 0.5 }}>{s.icon}</span>
                                        <span className="text-sm font-medium">{s.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-30" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile section tabs */}
                    <div className="md:hidden flex gap-2 overflow-x-auto mb-4 pb-1 w-full">
                        {SECTIONS.map(s => (
                            <button key={s.key} onClick={() => setActiveSection(s.key)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={activeSection === s.key
                                    ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                                    : { backgroundColor: 'white', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-5">
                        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                            {activeSection === 'general' && (
                                <SectionCard title="Paramètres généraux">
                                    <SettingRow label="Langue" description="Langue de l'interface">
                                        <select value={settings.language}
                                            onChange={e => updateSettings(['language'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                            <option value="mg">Malagasy</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Fuseau horaire">
                                        <select value={settings.timezone}
                                            onChange={e => updateSettings(['timezone'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="Indian/Antananarivo">Antananarivo (UTC+3)</option>
                                            <option value="Europe/Paris">Paris (UTC+1/+2)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Format de date">
                                        <select value={settings.dateFormat}
                                            onChange={e => updateSettings(['dateFormat'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Devise">
                                        <select value={settings.currency}
                                            onChange={e => updateSettings(['currency'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="MGA">Ariary (MGA)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                            <option value="USD">Dollar (USD)</option>
                                        </select>
                                    </SettingRow>
                                </SectionCard>
                            )}

                            {activeSection === 'notifications' && (
                                <SectionCard title="Préférences de notifications">
                                    <div className="p-3 rounded-xl flex items-start gap-2 mb-2"
                                        style={{ backgroundColor: 'rgba(26,60,94,0.04)', border: '1px solid var(--color-border)' }}>
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
                                        <p className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
                                            Les notifications en temps réel sont gérées via WebSocket et s'affichent dans la cloche en haut de l'écran.
                                        </p>
                                    </div>
                                    <SettingRow label="Notifications par email" description="Recevoir des emails pour les alertes importantes">
                                        <ToggleSwitch checked={settings.notifications.email} onChange={v => updateSettings(['notifications', 'email'], v)} />
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Alertes de vente">
                                        <ToggleSwitch checked={settings.notifications.saleAlert} onChange={v => updateSettings(['notifications', 'saleAlert'], v)} />
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Stock critique">
                                        <ToggleSwitch checked={settings.notifications.stockCritical} onChange={v => updateSettings(['notifications', 'stockCritical'], v)} />
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Équipement en panne">
                                        <ToggleSwitch checked={settings.notifications.equipmentDown} onChange={v => updateSettings(['notifications', 'equipmentDown'], v)} />
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Mises à jour de maintenance">
                                        <ToggleSwitch checked={settings.notifications.maintenanceUpdate} onChange={v => updateSettings(['notifications', 'maintenanceUpdate'], v)} />
                                    </SettingRow>
                                </SectionCard>
                            )}

                            {activeSection === 'display' && (
                                <SectionCard title="Options d'affichage">
                                    <SettingRow label="Thème" description="Apparence de l'interface">
                                        <select value={settings.display.theme}
                                            onChange={e => updateSettings(['display', 'theme'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="light">Clair</option>
                                            <option value="dark">Sombre (bientôt)</option>
                                            <option value="auto">Automatique</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Densité d'affichage">
                                        <select value={settings.display.density}
                                            onChange={e => updateSettings(['display', 'density'], e.target.value)}
                                            className={selectClass} style={selectStyle}>
                                            <option value="compact">Compact</option>
                                            <option value="comfortable">Confortable</option>
                                            <option value="spacious">Espacé</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Éléments par page">
                                        <select value={settings.display.itemsPerPage}
                                            onChange={e => updateSettings(['display', 'itemsPerPage'], parseInt(e.target.value))}
                                            className={selectClass} style={selectStyle}>
                                            {[10, 20, 50, 100].map(n => (
                                                <option key={n} value={n}>{n} éléments</option>
                                            ))}
                                        </select>
                                    </SettingRow>
                                </SectionCard>
                            )}

                            {activeSection === 'security' && (
                                <SectionCard title="Sécurité de la session">
                                    <SettingRow label="Expiration de session" description="Déconnexion automatique après inactivité">
                                        <select value={settings.security.sessionTimeout}
                                            onChange={e => updateSettings(['security', 'sessionTimeout'], parseInt(e.target.value))}
                                            className={selectClass} style={selectStyle}>
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>1 heure</option>
                                            <option value={480}>8 heures</option>
                                            <option value={0}>Jamais</option>
                                        </select>
                                    </SettingRow>
                                    <hr style={{ borderColor: 'var(--color-border)' }} />
                                    <SettingRow label="Double authentification" description="Sécurité renforcée (bientôt disponible)">
                                        <ToggleSwitch checked={settings.security.twoFactor} onChange={v => updateSettings(['security', 'twoFactor'], v)} disabled />
                                    </SettingRow>
                                    <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)' }}>
                                        <p className="text-xs" style={{ color: 'var(--color-accent)' }}>
                                            La double authentification sera disponible dans une prochaine mise à jour.
                                        </p>
                                    </div>
                                </SectionCard>
                            )}

                            {activeSection === 'data' && (
                                <SectionCard title="Gestion des données">
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                                                Exporter les données
                                            </p>
                                            <p className="text-xs opacity-50 mb-3" style={{ color: 'var(--color-text)' }}>
                                                Téléchargez une copie de toutes vos données au format CSV ou Excel.
                                            </p>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-gray-50"
                                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                    onClick={() => toast('Export CSV - bientôt disponible')}>
                                                    Export CSV
                                                </button>
                                                <button className="px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-gray-50"
                                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                    onClick={() => toast('Export Excel - bientôt disponible')}>
                                                    Export Excel
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(220,53,69,0.2)', backgroundColor: 'rgba(220,53,69,0.03)' }}>
                                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-danger)' }}>
                                                Zone de danger
                                            </p>
                                            <p className="text-xs mb-3" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                                                Ces actions sont irréversibles. Procédez avec précaution.
                                            </p>
                                            <button className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-red-100"
                                                style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                                                onClick={() => toast.error('Action réservée aux administrateurs')}>
                                                Vider le cache
                                            </button>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}
                        </motion.div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all hover:bg-gray-50"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                                <RefreshCw className="w-4 h-4" />
                                Réinitialiser
                            </button>

                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: savedIndicator ? 'var(--color-success)' : 'var(--color-primary)' }}>
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : savedIndicator ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Enregistrement...' : savedIndicator ? 'Enregistré !' : 'Sauvegarder'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;