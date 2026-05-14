// config/imageConfig.ts
export const IMAGE_CONFIG = {
    // Taille maximale
    maxSizeMB: 2,
    maxSizeBytes: 2 * 1024 * 1024, // 2MB

    // Dimensions recommandées
    maxWidth: 1920,
    maxHeight: 1080,
    minWidth: 200,
    minHeight: 200,

    // Formats acceptés
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    acceptedExtensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp'],

    // Qualité de compression (pour le redimensionnement)
    compressionQuality: 0.9,

    // Messages d'erreur personnalisés
    errorMessages: {
        fileTooLarge: (maxMB: number) => `L'image ne doit pas dépasser ${maxMB} MB`,
        invalidType: (extensions: string[]) => `Format non supporté. Utilisez: ${extensions.join(', ')}`,
        dimensionsTooSmall: (minWidth: number, minHeight: number) => `Dimensions minimales: ${minWidth}x${minHeight}px`,
        dimensionsTooLarge: (maxWidth: number, maxHeight: number) => `Dimensions maximales: ${maxWidth}x${maxHeight}px`,
        invalidFile: "Fichier invalide",
        readError: "Impossible de lire l'image"
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(IMAGE_CONFIG.errorMessages.readError));
        };

        img.src = url;
    });
};

export const validateImage = async (file: File): Promise<{ valid: boolean; errors: string[]; info?: any }> => {
    const errors: string[] = [];

    // Vérifier la taille
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
        errors.push(IMAGE_CONFIG.errorMessages.fileTooLarge(IMAGE_CONFIG.maxSizeMB));
    }

    // Vérifier le type
    if (!IMAGE_CONFIG.acceptedFormats.includes(file.type)) {
        errors.push(IMAGE_CONFIG.errorMessages.invalidType(IMAGE_CONFIG.acceptedExtensions));
    }

    // Vérifier les dimensions
    try {
        const dimensions = await getImageDimensions(file);

        if (dimensions.width < IMAGE_CONFIG.minWidth || dimensions.height < IMAGE_CONFIG.minHeight) {
            errors.push(IMAGE_CONFIG.errorMessages.dimensionsTooSmall(IMAGE_CONFIG.minWidth, IMAGE_CONFIG.minHeight));
        }
        if (dimensions.width > IMAGE_CONFIG.maxWidth || dimensions.height > IMAGE_CONFIG.maxHeight) {
            errors.push(IMAGE_CONFIG.errorMessages.dimensionsTooLarge(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight));
        }

        return {
            valid: errors.length === 0,
            errors,
            info: {
                width: dimensions.width,
                height: dimensions.height,
                size: file.size,
                type: file.type
            }
        };
    } catch (err) {
        errors.push(IMAGE_CONFIG.errorMessages.invalidFile);
        return { valid: false, errors };
    }
};