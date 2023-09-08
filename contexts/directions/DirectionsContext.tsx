import { createContext } from "react";
import { DirectionsContextType } from "../../utils/types"

const DirectionsContext = createContext<DirectionsContextType>({
    directions: undefined,
    setDirections: (directions) => null,
});

export default DirectionsContext;
