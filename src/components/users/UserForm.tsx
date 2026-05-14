// components/users/UserForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import userService from '../../services/userService';
import productService from '../../services/productService';
import type { UserRequest } from '../../types/user';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editUser?: any;
}

const ROLES = [
    { value: 'ADMIN', label: 'Administrateur', color: '#1A3C5E', description: 'Accès complet à toutes les fonctionnalités' },
    { value: 'MANAGER', label: 'Manager', color: '#1A3C5E', description: 'Gestion des ventes, produits et rapports' },
    { value: 'TECHNICIAN', label: 'Technicien', color: '#1A3C5E', description: 'Gestion des équipements et maintenance' }
];

const IMAGE_CONFIG = {
    maxSizeMB: 2,
    maxSizeBytes: 2 * 1024 * 1024,
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    acceptedExtensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp']
};

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSuccess, editUser }) => {
    const [formData, setFormData] = useState<UserRequest>({
        name: '',
        email: '',
        password: '',
        role: 'MANAGER',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (editUser) {
            setFormData({
                name: editUser.name || '',
                email: editUser.email || '',
                password: '',
                role: editUser.role || 'MANAGER',
                imageUrl: editUser.imageUrl || ''
            });
            setPreviewImage(editUser.imageUrl || '');
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'MANAGER',
                imageUrl: ''
            });
            setPreviewImage('');
        }
    }, [editUser]);

    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles && rejectedFiles.length > 0) {
            const err = rejectedFiles[0].errors[0];
            if (err.code === 'file-too-large') {
                setError(`L'image ne doit pas dépasser ${IMAGE_CONFIG.maxSizeMB} MB`);
            } else if (err.code === 'file-invalid-type') {
                setError(`Format non supporté. Utilisez: ${IMAGE_CONFIG.acceptedExtensions.join(', ')}`);
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
            const imageUrl = await productService.uploadImage(file, 'users');
            setFormData(prev => ({ ...prev, imageUrl }));
            setPreviewImage(imageUrl);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload de l\'image');
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
        maxSize: IMAGE_CONFIG.maxSizeBytes
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
            setError('Le nom est requis');
            setLoading(false);
            return;
        }
        if (!formData.email.trim()) {
            setError('L\'email est requis');
            setLoading(false);
            return;
        }
        if (!editUser && !formData.password) {
            setError('Le mot de passe est requis');
            setLoading(false);
            return;
        }

        try {
            if (editUser) {
                await userService.updateUser(editUser.id, formData);
            } else {
                await userService.createUser(formData);
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
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div
                    className="fixed inset-0 backdrop-blur-md transition-all duration-300"
                    style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }}
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(26, 60, 94, 0.1)' }}>
                        <h2 className="text-lg font-bold" style={{ color: '#1A3C5E' }}>
                            {editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
                        >
                            <X className="w-4 h-4" style={{ color: '#1A3C5E' }} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {error && (
                            <div className="p-2.5 rounded-xl flex items-center gap-2 text-sm" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: '#1A3C5E' }}>
                                <AlertCircle className="w-4 h-4" style={{ color: '#FFC107' }} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A3C5E' }}>
                                Photo de profil
                            </label>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-[#FFC107] bg-[rgba(255,193,7,0.05)]' : ''
                                    } ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                style={{ borderColor: 'rgba(26, 60, 94, 0.15)' }}
                            >
                                <input {...getInputProps()} disabled={uploading} />
                                {previewImage ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={previewImage}
                                            alt="Photo de profil"
                                            className="w-16 h-16 rounded-full object-cover mx-auto border-4 shadow-md"
                                            style={{ borderColor: '#1A3C5E' }}
                                        />
                                        {!uploading && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage();
                                                }}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(26, 60, 94, 0.08)' }}>
                                            <User className="w-6 h-6" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: '#1A3C5E' }}>
                                            {uploading ? 'Upload en cours...' : (isDragActive ? 'Déposez l\'image' : 'Cliquez ou glissez une photo')}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: '#1A3C5E', opacity: 0.5 }}>
                                            PNG, JPG max 2MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            {uploading && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span style={{ color: '#1A3C5E' }}>Upload...</span>
                                        <span style={{ color: '#1A3C5E' }}>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(26, 60, 94, 0.1)' }}>
                                        <div
                                            className="h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${uploadProgress}%`, backgroundColor: '#1A3C5E' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#1A3C5E' }}>
                                Nom complet <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
                                    style={{ borderColor: 'rgba(26, 60, 94, 0.15)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(26, 60, 94, 0.15)'}
                                    placeholder="Jean Dupont"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#1A3C5E' }}>
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
                                    style={{ borderColor: 'rgba(26, 60, 94, 0.15)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(26, 60, 94, 0.15)'}
                                    placeholder="jean@sesmos.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#1A3C5E' }}>
                                Mot de passe {!editUser && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!editUser}
                                    className="w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
                                    style={{ borderColor: 'rgba(26, 60, 94, 0.15)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(26, 60, 94, 0.15)'}
                                    placeholder={editUser ? 'Laisser vide pour conserver' : '••••••••'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {editUser && (
                                <p className="text-xs mt-1" style={{ color: '#1A3C5E', opacity: 0.5 }}>Laisser vide pour conserver</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#1A3C5E' }}>
                                Rôle <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#1A3C5E', opacity: 0.4 }} />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none text-sm"
                                    style={{ borderColor: 'rgba(26, 60, 94, 0.15)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(26, 60, 94, 0.15)'}
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.role && (
                                <p className="text-xs mt-1" style={{ color: '#1A3C5E', opacity: 0.6 }}>
                                    {ROLES.find(r => r.value === formData.role)?.description}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-xl border transition-all hover:bg-gray-50 font-medium text-sm"
                                style={{ borderColor: 'rgba(26, 60, 94, 0.15)', color: '#1A3C5E' }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 font-medium text-sm"
                                style={{ backgroundColor: '#1A3C5E' }}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Enregistrement...' : (editUser ? 'Modifier' : 'Créer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserForm;