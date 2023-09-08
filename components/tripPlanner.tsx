import { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

  import "@reach/combobox/styles.css";
  import Search from "./Search";
  import Itinerary from "./itinerary";
  import { Place, Campground } from "../utils/types";

import usePlaces from "@/components/hooks/usePlaces";
import useDirections from "@/components/hooks/useDirections";
import useSearch from "@/components/hooks/useSearch";
import useCamp from "@/components/hooks/useCamp";
  
  
  export default function TripPlanner() {
    const { campgrounds, setCampgrounds, dispersedCampsites, setDispersedCampsites, showCampgrounds, setShowCampgrounds, showDispersedCampsites, setShowDispersedCampsites, selectedCampground, selectCampground, selectedCampsite, selectCampsite, fetchDispersedCampsites, fetchCampgrounds } = useCamp();
    const { places, setPlaces, setSelectingPlace } = usePlaces()
    const { directions, setDirections } = useDirections()
    const { searchResult, setSearchResult } = useSearch()
    
    const [routeData, setRouteData] = useState<google.maps.DirectionsLeg[] | undefined>();

    const {
      ready,
      value,
      setValue,
      suggestions: { status, data },
      clearSuggestions,
    } = usePlacesAutocomplete();

    return (
      <div>
        <h1 className="planner-text">Trip Planner</h1>
        <Search setRouteData={setRouteData}/>

        {places && (
          <Itinerary routeData={routeData}
                              places={places} 
                              setPlaces={setPlaces} 
                              setDirections={setDirections} 
                              setSearchResult={setSearchResult}
          />
        )}
        </div>
    );
  }
  