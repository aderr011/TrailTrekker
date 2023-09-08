import React, { ReactNode, useMemo, useState } from "react";

import SearchContext from "./SearchContext";

const SearchProvider = ({ children } : {children: ReactNode}) => {
    const [searchResult, setSearchResult] = useState<google.maps.LatLngLiteral>();

    return (
        <SearchContext.Provider
            value={{
                searchResult,
                setSearchResult,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export default SearchProvider;
