import { useContext } from "react";

import DirectionsContext from "../contexts/directions/DirectionsContext";

const useDirections = () => useContext(DirectionsContext);

export default useDirections;
