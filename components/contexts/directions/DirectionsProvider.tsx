import React, { ReactNode, useMemo, useState } from "react";

import DirectionsContext from "./DirectionsContext";

const DirectionsProvider = ({ children } : {children: ReactNode}) => {
    const [directions, setDirections] = useState<google.maps.DirectionsResult | undefined>(undefined);

    return (
        <DirectionsContext.Provider
            value={{
                directions,
                setDirections,
            }}
        >
            {children}
        </DirectionsContext.Provider>
    );
}

export default DirectionsProvider;
