import { createContext } from "react";
import {Campground, DispersedCampsite, CampContextType} from "../../utils/types"

const CampContext = createContext<CampContextType>({
    campgrounds: undefined,
    setCampgrounds: (campgrounds) => null,
    dispersedCampsites: undefined,
    setDispersedCampsites: (dispersedCampsites) => null,
    showDispersedCampsites: undefined,
    setShowDispersedCampsites: (bool) => null,
    showCampgrounds: undefined,
    setShowCampgrounds: (bool) => null,
    selectedCampground: undefined,
    selectCampground: (campground) => null,
    selectedCampsite: undefined,
    selectCampsite: (campsite) => null,
    fetchDispersedCampsites: () => Promise.resolve(undefined),
    fetchCampgrounds: () => Promise.resolve(undefined),
});

export default CampContext;
