import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Save, Building2, Mail, Phone, MapPin, User, Camera, X, Edit2 } from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientCompanyProfile: React.FC = () => {
    const { clientData, loading, refreshClientData } = useClientAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoProgress, setLogoProgress] = useState(0);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        contactName: '',
        phone: '',
        address: '',
        taxId: '',
        vatNumber: ''
    });

    useEffect(() => {
        if (clientData) {
            setFormData({
                companyName: clientData.companyName || '',
                email: clientData.email || '',
                contactName: clientData.contactName || '',
                phone: clientData.phone || '',
                address: clientData.address || '',
                taxId: clientData.taxId || '',
                vatNumber: clientData.vatNumber || ''
            });
            setLogoPreview(clientData.logoUrl || null);
        }
    }, [clientData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image ne doit pas dépasser 2 Mo');
            return;
        }

        setUploadingLogo(true);
        setLogoProgress(0);

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const interval = setInterval(() => {
            setLogoProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 200);

        try {
            const response = await api.post('/clients/upload-logo', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setLogoProgress(percent);
                    }
                }
            });

            clearInterval(interval);
            setLogoProgress(100);

            if (response.data.success) {
                setLogoPreview(response.data.imageUrl);
                toast.success('Logo entreprise mis à jour');
                await refreshClientData();
            }
        } catch (error: any) {
            clearInterval(interval);
            console.error('Error uploading logo:', error);
            toast.error(error.response?.data?.error || 'Erreur lors du téléchargement');
        } finally {
            setTimeout(() => {
                setUploadingLogo(false);
                setLogoProgress(0);
            }, 500);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientData) return;

        setSaving(true);
        try {
            await api.put(`/clients/${clientData.id}`, {
                companyName: formData.companyName,
                contactName: formData.contactName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                taxId: formData.taxId,
                vatNumber: formData.vatNumber,
                logoUrl: logoPreview || clientData.logoUrl
            });
            await refreshClientData();
            toast.success('Informations entreprise mises à jour');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error updating client:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent }} />
            </div>
        );
    }

    if (!clientData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-md">
                    <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary, opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>Aucune donnée entreprise</h3>
                    <p className="text-sm mt-2" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        Veuillez contacter l'administrateur
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
            <main className="p-4 md:p-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Mon entreprise</h1>
                        <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>Gérez les informations de votre entreprise</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" style={{ color: COLORS.accent }} />
                                <h2 className="font-semibold" style={{ color: COLORS.primary }}>Informations entreprise</h2>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: `${COLORS.accent}15`, color: COLORS.accent }}
                                >
                                    Modifier
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Logo section */}
                            <div className="flex flex-col items-center mb-6 pb-4 border-b" style={{ borderColor: COLORS.border }}>
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 flex items-center justify-center shadow-md" style={{ borderColor: COLORS.accent }}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-12 h-12" style={{ color: COLORS.primary, opacity: 0.3 }} />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-105" style={{ backgroundColor: COLORS.accent }}>
                                            <Camera className="w-4 h-4" style={{ color: COLORS.primary }} />
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                                        </label>
                                    )}
                                </div>

                                {uploadingLogo && (
                                    <div className="w-64 mt-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Téléchargement...</span>
                                            <span className="text-xs font-medium" style={{ color: COLORS.accent }}>{logoProgress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{ width: `${logoProgress}%`, backgroundColor: COLORS.accent }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Nom de l'entreprise
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Email de l'entreprise
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Nom du contact
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Téléphone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        NIF / Tax ID
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            name="taxId"
                                            value={formData.taxId}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        N° TVA / VAT
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <input
                                            type="text"
                                            name="vatNumber"
                                            value={formData.vatNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                        Adresse
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            rows={3}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm resize-none ${!isEditing ? 'bg-gray-50' : ''}`}
                                            style={{ borderColor: COLORS.border }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                                    >
                                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Enregistrer
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ClientCompanyProfile;