import { createContext } from "react";
import {Campground, DispersedCampsite, CampContextType} from "../utils/constants"

const CampContext: CampContextType = createContext({
    selectedCampground: undefined,
    selectedCampsite: undefined,
    fetchDispersedCampsites: () => null,
    fetchCampgrounds: () => null,
});

export default CampContext;
