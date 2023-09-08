import { useContext } from "react";

import SearchContext from "../contexts/search/SearchContext";

const useSearch = () => useContext(SearchContext);

export default useSearch;
