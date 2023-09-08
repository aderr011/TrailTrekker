import { createContext } from "react";
import { PlacesContextType } from "../../../utils/types"

const PlacesContext = createContext<PlacesContextType>({
    places: [],
    setPlaces: (places) => null,
    selectingPlace: undefined,
    setSelectingPlace: (bool) => null,
});

export default PlacesContext;
