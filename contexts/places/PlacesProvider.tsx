import React, { ReactNode, useMemo, useState } from "react";

import PlacesContext from "./PlacesContext";
import { Place } from "../../utils/types"

const PlacesProvider = ({ children } : {children: ReactNode}) => {
    const [places, setPlaces] = useState<Place[]>([]);

    const [selectingPlace, setSelectingPlace] = useState<boolean>(false);

    return (
        <PlacesContext.Provider
            value={{
                places,
                setPlaces,
                selectingPlace,
                setSelectingPlace,
            }}
        >
            {children}
        </PlacesContext.Provider>
    );
}

export default PlacesProvider;
