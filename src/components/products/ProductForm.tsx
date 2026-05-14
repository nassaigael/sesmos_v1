import React, { useState, useCallback, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import productService from '../../services/productService';
import type { ProductRequest, ProductCategory } from '../../types/product';

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editProduct?: any;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    white: '#FFFFFF',
    border: 'rgba(26, 60, 94, 0.08)',
    borderLight: 'rgba(26, 60, 94, 0.04)'
};

const CATEGORIES: ProductCategory[] = [
    { name: 'AGRICULTURAL', displayName: 'Agricole', description: 'Matériel agricole et d\'élevage' },
    { name: 'CONSTRUCTION', displayName: 'Construction', description: 'Matériaux et équipements de construction' },
    { name: 'ELECTRICITY', displayName: 'Électricité', description: 'Matériel électrique et éclairage' },
    { name: 'PLUMBING', displayName: 'Plomberie', description: 'Équipements de plomberie et sanitaires' },
    { name: 'TOOLS', displayName: 'Outillage', description: 'Outils manuels et électriques' },
    { name: 'INDUSTRIAL', displayName: 'Industriel', description: 'Équipements et machines industrielles' },
    { name: 'SPARE_PARTS', displayName: 'Pièces détachées', description: 'Pièces de rechange et accessoires' }
];

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSuccess, editProduct }) => {
    const [formData, setFormData] = useState<ProductRequest>({
        name: '',
        description: '',
        price: 0,
        category: 'AGRICULTURAL',
        imageUrl: '',
        stockQuantity: 0,
        minimumStock: 10,
        unit: 'pièce'
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (editProduct) {
            setFormData({
                name: editProduct.name || '',
                description: editProduct.description || '',
                price: editProduct.price || 0,
                category: editProduct.category || 'AGRICULTURAL',
                imageUrl: editProduct.imageUrl || '',
                stockQuantity: editProduct.stockQuantity || 0,
                minimumStock: editProduct.minimumStock || 10,
                unit: editProduct.unit || 'pièce'
            });
            setPreviewImage(editProduct.imageUrl || '');
        } else if (isOpen) {
            setFormData({
                name: '',
                description: '',
                price: 0,
                category: 'AGRICULTURAL',
                imageUrl: '',
                stockQuantity: 0,
                minimumStock: 10,
                unit: 'pièce'
            });
            setPreviewImage('');
            setError(null);
        }
    }, [editProduct, isOpen]);

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
            const imageUrl = await productService.uploadImage(file, formData.category.toLowerCase());
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
    }, [formData.category]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue: string | number = value;
        if (name === 'price' || name === 'stockQuantity' || name === 'minimumStock') {
            newValue = parseFloat(value) || 0;
        }
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name.trim()) {
            setError('Le nom du produit est requis');
            setLoading(false);
            return;
        }
        if (formData.price <= 0) {
            setError('Le prix doit être supérieur à 0');
            setLoading(false);
            return;
        }

        try {
            if (editProduct) {
                await productService.updateProduct(editProduct.id, formData);
            } else {
                await productService.createProduct(formData);
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

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300">
                    <div className="relative h-20" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
                        <div className="absolute bottom-3 left-5">
                            <h2 className="text-white font-semibold text-base">
                                {editProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h2>
                            <p className="text-white/60 text-xs">
                                {editProduct ? 'Mettez à jour les informations' : 'Ajoutez un produit au catalogue'}
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
                                <AlertCircle className="w-4 h-4" style={{ color: '#DC3545' }} />
                                <span className="text-sm" style={{ color: '#DC3545' }}>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>Image du produit</label>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-2 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-[#FFC107] bg-[rgba(255,193,7,0.05)]' : ''
                                    } ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                style={{ borderColor: COLORS.border, minHeight: '80px' }}
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
                                                className="w-7 h-7 bg-[#1A3C5E] text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1 py-1">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                                            {uploading ? (
                                                <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.primary }} />
                                            ) : (
                                                <Upload className="w-3.5 h-3.5" style={{ color: COLORS.primary, opacity: 0.5 }} />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Nom du produit *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                        placeholder="Ex: Tracteur agricole"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Catégorie *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Prix (Ar) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="100"
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Unité</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    >
                                        <option value="pièce">Pièce</option>
                                        <option value="kg">Kilogramme</option>
                                        <option value="litre">Litre</option>
                                        <option value="mètre">Mètre</option>
                                        <option value="carton">Carton</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Quantité en stock</label>
                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Seuil d'alerte minimum</label>
                                    <input
                                        type="number"
                                        name="minimumStock"
                                        value={formData.minimumStock}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all resize-none"
                                style={{ borderColor: COLORS.border }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                placeholder="Description détaillée du produit..."
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-3 py-1.5 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {loading ? 'Enregistrement...' : (editProduct ? 'Modifier' : 'Créer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;