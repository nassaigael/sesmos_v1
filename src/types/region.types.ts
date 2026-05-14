export interface Region {
    id: string;
    name: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
}

export interface RegionRequest {
    name: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
}

export interface RegionFilters {
    search?: string;
    country?: string;
}

export interface Region extends RegionRequest {
    id: string;
}