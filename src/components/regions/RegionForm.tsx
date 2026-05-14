import React, { useState, useEffect } from 'react';
import { X, Save, Globe, MapPin, Search, Loader2, Map, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import regionService from '../../services/regionService';
import type { RegionRequest } from '../../types/region.types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RegionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editRegion?: any;
}

const COLORS = {
    primary: '#1A3C5E',
    warning: '#FFC107',
    danger: '#DC3545',
    border: 'rgba(26, 60, 94, 0.1)'
};

const COUNTRIES = [
    'Madagascar', 'France', 'Canada', 'Belgique', 'Suisse',
    "Côte d'Ivoire", 'Sénégal', 'Maurice', 'Comores', 'La Réunion'
];

interface SearchResult {
    lat: string;
    lon: string;
    display_name: string;
}

function LocationMarker({ setPosition }: { setPosition: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const RegionForm: React.FC<RegionFormProps> = ({ isOpen, onClose, onSuccess, editRegion }) => {
    const [formData, setFormData] = useState<RegionRequest>({
        name: editRegion?.name || '',
        country: editRegion?.country || 'Madagascar',
        latitude: editRegion?.latitude ?? null,
        longitude: editRegion?.longitude ?? null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-18.8792, 47.5079]);
    const [mapZoom, setMapZoom] = useState(6);

    useEffect(() => {
        if (editRegion) {
            setFormData({
                name: editRegion.name || '',
                country: editRegion.country || 'Madagascar',
                latitude: editRegion.latitude ?? null,
                longitude: editRegion.longitude ?? null
            });
            if (editRegion.latitude && editRegion.longitude) {
                setMapCenter([editRegion.latitude, editRegion.longitude]);
                setMapZoom(10);
            }
        }
    }, [editRegion]);

    useEffect(() => {
        if (formData.latitude && formData.longitude) {
            setMapCenter([formData.latitude, formData.longitude]);
            setMapZoom(10);
        }
    }, [formData.latitude, formData.longitude]);

    const searchLocation = async () => {
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un nom de lieu à rechercher');
            return;
        }

        setSearchingLocation(true);
        setError(null);
        setShowResults(false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=10&addressdetails=1&accept-language=fr`,
                {
                    headers: {
                        'User-Agent': 'SESMOS-Application/1.0 (contact@sesmos.com)',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                setSearchResults(data);
                setShowResults(true);
            } else {
                setError(`Aucun résultat trouvé pour "${searchQuery}"`);
                setSearchResults([]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('La recherche a pris trop de temps, veuillez réessayer');
            } else {
                console.error('Erreur de recherche:', err);
                setError('Erreur lors de la recherche. Veuillez réessayer.');
            }
        } finally {
            setSearchingLocation(false);
        }
    };

    const selectLocation = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const fullName = result.display_name;
        const nameParts = fullName.split(',');
        const regionName = nameParts[0].trim();
        let country = formData.country;
        for (const part of nameParts) {
            const trimmedPart = part.trim();
            if (COUNTRIES.some(c => trimmedPart.includes(c) || c.includes(trimmedPart))) {
                const found = COUNTRIES.find(c => trimmedPart.includes(c) || c.includes(trimmedPart));
                if (found) country = found;
                break;
            }
        }
        setFormData((prev: RegionRequest) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            name: regionName,
            country: country
        }));
        setMapCenter([lat, lng]);
        setMapZoom(12);
        setShowResults(false);
        setSearchQuery('');
    };

    const setMapPosition = (lat: number, lng: number) => {
        setFormData((prev: RegionRequest) => ({ ...prev, latitude: lat, longitude: lng }));
        setMapCenter([lat, lng]);
    };

    const getCurrentLocation = () => {
        setSearchingLocation(true);
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur');
            setSearchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=fr`,
                        {
                            headers: { 'User-Agent': 'SESMOS-Application/1.0 (contact@sesmos.com)' }
                        }
                    );
                    const data = await response.json();

                    setFormData((prev: RegionRequest) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(12);

                    if (data.address?.state) {
                        setFormData((prev: RegionRequest) => ({ ...prev, name: data.address.state }));
                    } else if (data.address?.region) {
                        setFormData((prev: RegionRequest) => ({ ...prev, name: data.address.region }));
                    } else if (data.address?.city) {
                        setFormData((prev: RegionRequest) => ({ ...prev, name: data.address.city }));
                    }

                    if (data.address?.country) {
                        setFormData((prev: RegionRequest) => ({ ...prev, country: data.address.country }));
                    }
                } catch (err) {
                    setError('Erreur lors de la récupération de la position');
                } finally {
                    setSearchingLocation(false);
                }
            },
            (err) => {
                let errorMessage = 'Impossible d\'obtenir votre position';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Vous avez refusé l\'accès à votre position';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Position indisponible';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Délai d\'attente dépassé';
                        break;
                }
                setError(errorMessage);
                setSearchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'latitude' || name === 'longitude') {
            const numValue = value === '' ? null : parseFloat(value);
            setFormData((prev: RegionRequest) => ({ ...prev, [name]: numValue }));
        } else {
            setFormData((prev: RegionRequest) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name.trim()) {
            setError('Le nom de la région est requis');
            setLoading(false);
            return;
        }

        try {
            if (editRegion) {
                await regionService.updateRegion(editRegion.id, formData);
            } else {
                await regionService.createRegion(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
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

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b" style={{ borderColor: COLORS.border }}>
                        <div className="flex items-center justify-between px-6 py-4">
                            <div>
                                <h2 className="font-bold text-base" style={{ color: COLORS.primary }}>
                                    {editRegion ? 'Modifier la région' : 'Nouvelle région'}
                                </h2>
                                <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                    {editRegion ? 'Mettez à jour les informations' : 'Ajoutez une région au système'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                            >
                                <X className="w-5 h-5" style={{ color: COLORS.primary, opacity: 0.5 }} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: `${COLORS.danger}10` }}>
                                <span className="text-sm" style={{ color: COLORS.danger }}>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
                                Localisation sur la carte
                            </label>
                            <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: COLORS.border, height: '320px' }}>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationMarker setPosition={setMapPosition} />
                                    {formData.latitude && formData.longitude && (
                                        <Marker position={[formData.latitude, formData.longitude]} />
                                    )}
                                </MapContainer>
                            </div>
                            <p className="text-xs mt-2" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                Cliquez sur la carte pour placer le marqueur
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
                                Rechercher un lieu
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                                        placeholder="Ex: Antananarivo, Toamasina, Mahajanga..."
                                        className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={searchLocation}
                                    disabled={searchingLocation}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                >
                                    {searchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
                                    Chercher
                                </button>
                            </div>

                            {searchingLocation && (
                                <div className="mt-2 text-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
                                    <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>Recherche en cours...</p>
                                </div>
                            )}

                            {showResults && searchResults.length > 0 && (
                                <div className="mt-2 border rounded-xl overflow-hidden max-h-60 overflow-y-auto" style={{ borderColor: COLORS.border }}>
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selectLocation(result)}
                                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0"
                                            style={{ borderColor: COLORS.border }}
                                        >
                                            <span className="font-medium block">{result.display_name.split(',')[0]}</span>
                                            <span className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>
                                                {result.display_name.split(',').slice(1, 4).join(', ')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
                                    Nom de la région *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                        placeholder="Ex: Analamanga"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>Pays *</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                    >
                                        {COUNTRIES.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude ?? ''}
                                    onChange={handleChange}
                                    placeholder="-18.8792"
                                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude ?? ''}
                                    onChange={handleChange}
                                    placeholder="47.5079"
                                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.warning}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={searchingLocation}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-50"
                                style={{ color: COLORS.primary }}
                            >
                                <Crosshair className="w-4 h-4" />
                                Utiliser ma position
                            </button>
                            <p className="text-xs" style={{ color: COLORS.primary, opacity: 0.4 }}>
                                Coordonnées optionnelles
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Enregistrement...' : (editRegion ? 'Modifier' : 'Créer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegionForm;