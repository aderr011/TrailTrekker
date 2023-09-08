import React, { ReactNode, useMemo, useState } from "react";

import CampContext from "./CampContext";
import {Campground, DispersedCampsite} from "../../../utils/types"

const CampProvider = ({ children } : {children: ReactNode}) => {
    const [campgrounds, setCampgrounds] = useState<Campground[]>();

    const [dispersedCampsites, setDispersedCampsites] = useState<DispersedCampsite[]>();

    const [showDispersedCampsites, setShowDispersedCampsites] = useState<boolean>(true);

    const [showCampgrounds, setShowCampgrounds] = useState<boolean>(true);

    const [selectedCampground, setSelectedCampground] = useState<Campground | undefined>();
    const selectCampground = ((campground: Campground | undefined) => setSelectedCampground(campground));

    const [selectedCampsite, setSelectedCampsite] = useState<DispersedCampsite | undefined>();
    const selectCampsite = ((campsite: DispersedCampsite | undefined) => setSelectedCampsite(campsite));

    const fetchDispersedCampsites = async() => {
        const response = await fetch("/dispersed_campsites.geojson");
        const data = await response.json();
        return data.features
    }

    const fetchCampgrounds = async () => {
        const baseURL =
        "https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/0/query?where=1%3D1&outFields=FID,SITE_NAME,TYPE,QUANTITY,AGENCY&resultRecordCount=2000&f=geojson"

        let resultOffset = 0;
        let allResults: Campground[] = [];
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(`${baseURL}&resultOffset=${resultOffset.toString()}`);
            // const response = await fetch(baseURL)
            const data = await response.json();

            allResults = [...allResults, ...data.features];

            // If 'exceededTransferLimit' is true, there are more records to fetch
            hasMore = (data.properties) ? data.properties.exceededTransferLimit : false

            if (hasMore) {
                resultOffset += 2000; // Increment resultOffset by resultRecordCount to fetch the next batch
            }
        }
        
        return allResults;
    };

    return (
        <CampContext.Provider
            value={{
                campgrounds,
                setCampgrounds,
                dispersedCampsites,
                setDispersedCampsites,
                showDispersedCampsites,
                setShowDispersedCampsites,
                showCampgrounds,
                setShowCampgrounds,
                selectedCampground,
                selectCampground,
                selectedCampsite,
                selectCampsite,
                fetchDispersedCampsites,
                fetchCampgrounds,
            }}
        >
            {children}
        </CampContext.Provider>
    );
}

export default CampProvider;
