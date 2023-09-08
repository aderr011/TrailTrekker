import { createContext } from "react";
import { SearchContextType } from "../../utils/types"

const SearchContext = createContext<SearchContextType>({
    searchResult: undefined,
    setSearchResult: (result) => null,
});

export default SearchContext;