import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, Upload, Trash2, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import equipmentService from '../../services/equipmentService';
import type { EquipmentRequest } from '../../types/equipment.types';

interface EquipmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editEquipment?: any;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.08)',
    borderLight: 'rgba(26, 60, 94, 0.04)'
};

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'MAINTENANCE', label: 'En maintenance' },
    { value: 'DOWN', label: 'Hors service' }
];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ isOpen, onClose, onSuccess, editEquipment }) => {
    const [formData, setFormData] = useState<EquipmentRequest>({
        name: '',
        serialNumber: '',
        status: 'ACTIVE',
        imageUrl: '',
        productId: '',
        regionId: '',
        clientId: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, regionsRes, clientsRes] = await Promise.all([
                    equipmentService.getProducts(),
                    equipmentService.getRegions(),
                    equipmentService.getClients()
                ]);
                setProducts(productsRes);
                setRegions(regionsRes);
                setClients(clientsRes);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        if (isOpen) loadData();
    }, [isOpen]);

    useEffect(() => {
        if (editEquipment) {
            setFormData({
                name: editEquipment.name || '',
                serialNumber: editEquipment.serialNumber || '',
                status: editEquipment.status || 'ACTIVE',
                imageUrl: editEquipment.imageUrl || '',
                productId: editEquipment.product?.id || '',
                regionId: editEquipment.region?.id || '',
                clientId: editEquipment.client?.id || ''
            });
            setPreviewImage(editEquipment.imageUrl || '');
        } else if (isOpen) {
            setFormData({
                name: '',
                serialNumber: '',
                status: 'ACTIVE',
                imageUrl: '',
                productId: '',
                regionId: '',
                clientId: ''
            });
            setPreviewImage('');
            setError(null);
        }
    }, [editEquipment, isOpen]);

    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles && rejectedFiles.length > 0) {
            const err = rejectedFiles[0].errors[0];
            if (err.code === 'file-too-large') {
                setError('L\'image ne doit pas dépasser 5MB.');
            } else if (err.code === 'file-invalid-type') {
                setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
            }
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        const localPreview = URL.createObjectURL(file);
        setPreviewImage(localPreview);

        const interval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        try {
            const imageUrl = await equipmentService.uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrl }));
            setPreviewImage(imageUrl);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload');
            setPreviewImage('');
        } finally {
            clearInterval(interval);
            setUploading(false);
            URL.revokeObjectURL(localPreview);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'image/webp': ['.webp']
        },
        maxFiles: 1,
        multiple: false,
        maxSize: 5 * 1024 * 1024
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name.trim()) {
            setError('Le nom de l\'équipement est requis');
            setLoading(false);
            return;
        }
        if (!formData.productId) {
            setError('Le produit associé est requis');
            setLoading(false);
            return;
        }
        if (!formData.regionId) {
            setError('La région est requise');
            setLoading(false);
            return;
        }

        try {
            if (editEquipment) {
                await equipmentService.update(editEquipment.id, formData);
            } else {
                await equipmentService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        setPreviewImage('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div
                    className="fixed inset-0 backdrop-blur-md transition-all duration-300"
                    style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }}
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300">
                    <div className="relative h-20" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                        <div className="absolute bottom-3 left-5">
                            <h2 className="text-white font-semibold text-base">
                                {editEquipment ? 'Modifier l\'équipement' : 'Nouvel équipement'}
                            </h2>
                            <p className="text-white/60 text-xs">
                                {editEquipment ? 'Mettez à jour les informations' : 'Ajoutez un équipement au parc'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {error && (
                            <div className="p-2.5 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                                <AlertCircle className="w-4 h-4" style={{ color: COLORS.danger }} />
                                <span className="text-sm" style={{ color: COLORS.danger }}>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>Image de l'équipement</label>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-[#FFC107] bg-[rgba(255,193,7,0.05)]' : ''
                                    } ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                style={{ borderColor: COLORS.border }}
                            >
                                <input {...getInputProps()} disabled={uploading} />
                                {previewImage ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                            <img src={previewImage} alt="Aperçu" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-medium" style={{ color: COLORS.primary }}>Image chargée</p>
                                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.4 }}>Cliquez ou glissez pour changer</p>
                                        </div>
                                        {!uploading && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0"
                                                style={{ backgroundColor: COLORS.danger, color: COLORS.white }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1 py-2">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                            {uploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: COLORS.primary }} />
                                            ) : (
                                                <Upload className="w-4 h-4" style={{ color: COLORS.primary, opacity: 0.5 }} />
                                            )}
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: COLORS.primary }}>
                                            {uploading ? 'Upload en cours...' : (isDragActive ? 'Déposez l\'image' : 'Cliquez ou glissez une image')}
                                        </p>
                                        <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.4 }}>PNG, JPG, GIF, WEBP (max 5MB)</p>
                                    </div>
                                )}
                            </div>
                            {uploading && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-0.5">
                                        <span style={{ color: COLORS.primary }}>Upload</span>
                                        <span style={{ color: COLORS.warning }}>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
                                        <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%`, backgroundColor: COLORS.warning }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Nom *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                placeholder="Ex: Routeur Cisco 4321"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Numéro de série *</label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                placeholder="SN-XXXXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Client (optionnel)</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                <select
                                    name="clientId"
                                    value={formData.clientId || ''}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all bg-white appearance-none"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                >
                                    <option value="">Aucun client (stock / non attribué)</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.companyName}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                Sélectionnez un client si l'équipement est installé chez un client
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Produit associé *</label>
                            <select
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all bg-white"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                            >
                                <option value="">Sélectionner un produit</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Région *</label>
                            <select
                                name="regionId"
                                value={formData.regionId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all bg-white"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                            >
                                <option value="">Sélectionner une région</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Statut</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all bg-white"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-3 py-2 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {loading ? 'Enregistrement...' : (editEquipment ? 'Modifier' : 'Créer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EquipmentForm;