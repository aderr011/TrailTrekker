export type Place = {
    name: string;
    lat: number;
    lng: number;
};

export type Campsite = {
    geometry: Geometry;
    id: number;
    properties: Properties;
    type: string;
}

type Properties = {
    FID: number;
    SITE_NAME: string;
    QUANTITY: number;
    TYPE: string;
    AGENCY: string;
}

type Geometry = {
    type: string;
    coordinates: Array<number>;
}