export type CampContextType = {
    selectedCampground: Campground | undefined;
    selectedCampsite: DispersedCampsite | undefined;
    fetchDispersedCampsites: () => void;
    fetchCampgrounds: () => void;
}

export type Place = {
    name: string;
    lat: number;
    lng: number;
};

export type Campground = {
    geometry: Geometry;
    id: number;
    properties: CampgroundProperties;
    type: string;
}

export type CampgroundProperties = {
    FID: number;
    SITE_NAME: string;
    QUANTITY: number;
    TYPE: string;
    AGENCY: string;
}

export type Geometry = {
    type: string;
    coordinates: Array<number>;
}

export type TrailInfo = {
    name: string; 
    length: number; 
    description: string; 
    system: string; 
    level: string; 
    forest: string; 
    dateRange: string; 
    allowedVehicles: string|undefined; 
    coordinates: google.maps.LatLngLiteral;
}

export type DispersedCampsite = {
    type: string;
    geometry: Geometry;
    id: number;
    properties: CampsiteProperties;
    
}

export type CampsiteProperties = {
    id: string;
    updated_date: string;
    time_created: string;
    deleted: boolean;
    title: string;
    public: boolean;
    is_active: boolean;
    icon: string;
    revision: number;
    notes: string;
    latitude: number;
    longitude: number;
    elevation: number;
    attr: string;
    track_id: string;
    photos: Array<string>;
    order: string;
    folder: string;
    marker_type: string;
    marker_color: string;
    marker_decoration: string;
}

export type SitesStructureProperties = {
    id: string;
    name: string;
    updated_date: string;
    time_created: string;
    notes: string;
    cover_photo_id: string;
}

export type SitesStructure = {
    type: string;
    id: string;
    properties: SitesStructureProperties;
    features: Array<DispersedCampsite>;
}

