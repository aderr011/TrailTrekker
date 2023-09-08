import { useContext } from "react";

import PlacesContext from "../contexts/places/PlacesContext";

const usePlaces = () => useContext(PlacesContext);

export default usePlaces;