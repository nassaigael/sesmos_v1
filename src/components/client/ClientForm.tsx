import React, { useEffect, useState, useRef } from 'react';
import { X, Save, AlertCircle, Building2, User, Mail, Phone, MapPin, FileText, CreditCard, Upload, Trash2 } from 'lucide-react';
import clientService from '../../services/clientService';
import type { Client, ClientRequest } from '../../types/client.types';

interface ClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editClient?: Client;
}

const COLORS = {
    primary: '#1A3C5E',
    secondary: '#2A5C8E',
    accent: '#FFC107',
    white: '#FFFFFF',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)'
};

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSuccess, editClient }) => {
    const [formData, setFormData] = useState<ClientRequest>({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        vatNumber: '',
        logoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editClient) {
            setFormData({
                companyName: editClient.companyName,
                contactName: editClient.contactName,
                email: editClient.email,
                phone: editClient.phone,
                address: editClient.address || '',
                taxId: editClient.taxId || '',
                vatNumber: editClient.vatNumber || '',
                logoUrl: editClient.logoUrl || ''
            });
            setImagePreview(editClient.logoUrl || null);
            setImageError(false);
        } else {
            setFormData({
                companyName: '',
                contactName: '',
                email: '',
                phone: '',
                address: '',
                taxId: '',
                vatNumber: '',
                logoUrl: ''
            });
            setImagePreview(null);
            setImageError(false);
        }
        setError(null);
    }, [editClient, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return null;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('L\'image ne doit pas dépasser 2 Mo');
            return null;
        }
        return file;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validatedFile = await handleImageUpload(file);
        if (!validatedFile) return;

        setUploading(true);
        setError(null);

        const previewUrl = URL.createObjectURL(validatedFile);
        setImagePreview(previewUrl);

        try {
            const imageUrl = await clientService.uploadClientLogo(validatedFile);
            setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
            setImageError(false);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Erreur lors du téléchargement de l\'image');
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, logoUrl: '' }));
        setImageError(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): boolean => {
        if (!formData.companyName.trim()) {
            setError('Le nom de l\'entreprise est requis');
            return false;
        }
        if (!formData.contactName.trim()) {
            setError('Le nom du contact est requis');
            return false;
        }
        if (!formData.email.trim()) {
            setError('L\'email est requis');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Format d\'email invalide');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Le numéro de téléphone est requis');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            if (editClient) {
                await clientService.updateClient(editClient.id, formData);
            } else {
                await clientService.createClient(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }} onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
                        <div className="px-6 pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                                        <Building2 className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">
                                            {editClient ? 'Modifier le client' : 'Nouveau client'}
                                        </h2>
                                        <p className="text-white/60 text-xs">
                                            {editClient ? 'Modifier les informations du client' : 'Ajouter un nouveau client'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center">
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                                <AlertCircle className="w-4 h-4" style={{ color: COLORS.danger }} />
                                <span className="text-sm" style={{ color: COLORS.danger }}>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Logo de l'entreprise
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#FFC107] group"
                                        style={{ borderColor: COLORS.border, backgroundColor: COLORS.borderLight }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploading ? (
                                            <div className="w-6 h-6 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
                                        ) : imagePreview && !imageError ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full rounded-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.primary }} />
                                                <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Upload</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                                            Télécharger un logo
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                            Formats acceptés: JPG, PNG, GIF. Max 2 Mo.
                                        </p>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="mt-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Supprimer le logo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Nom de l'entreprise <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Nom de l'entreprise"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Nom du contact <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        placeholder="Nom du contact"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@entreprise.com"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    Téléphone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+261 XX XXX XXXX"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
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
                                        placeholder="Adresse complète"
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    NIF/Tax ID
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                        placeholder="NIF"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
                                    N° TVA / VAT
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        name="vatNumber"
                                        value={formData.vatNumber}
                                        onChange={handleChange}
                                        placeholder="N° TVA"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-4 border-t" style={{ borderColor: COLORS.border }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || uploading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
                            >
                                {loading || uploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {editClient ? 'Modifier' : 'Créer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientForm;