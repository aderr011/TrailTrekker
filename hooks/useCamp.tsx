import { useContext } from "react";

import CampContext from "../contexts/CampContext";

const useAccount = () => useContext(CampContext);

export default useAccount;
