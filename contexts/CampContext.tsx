import { createContext } from "react";
import {Campground, DispersedCampsite, CampContextType} from "../utils/constants"

const CampContext = createContext<CampContextType>({
    selectedCampground: undefined,
    selectCampground: (campground) => null,
    selectedCampsite: undefined,
    selectCampsite: (campsite) => null,
    fetchDispersedCampsites: () => Promise.resolve(undefined),
    fetchCampgrounds: () => Promise.resolve(undefined),
});

export default CampContext;
