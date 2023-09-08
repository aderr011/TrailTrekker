import { useContext } from "react";

import CampContext from "../contexts/camp/CampContext";

const useCamp = () => useContext(CampContext);

export default useCamp;
