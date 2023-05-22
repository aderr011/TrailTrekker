import { useState, useMemo, useCallback, useRef } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";

  import "@reach/combobox/styles.css";
  import Search from "./Search";
  import Itinerary from "./itinerary";
  import { Place } from "../../constants";


  
  type TripPlannerProps = {
    setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
    searchResult: (google.maps.LatLngLiteral | undefined);
    setDirections: (result: google.maps.DirectionsResult | undefined) => void;
  };
  
  export default function TripPlanner({ setSearchResult, searchResult, setDirections }: TripPlannerProps) {
    

    const usePlaces = (): [Place[], (list: Place[]) => void] => {
      const [list, setList] = useState<Place[]>([]);
    
      return [list, setList];
    };
    const [places, setPlaces] = usePlaces();

    
    const {
      ready,
      value,
      setValue,
      suggestions: { status, data },
      clearSuggestions,
    } = usePlacesAutocomplete();
    
  
    return (
      <>
        <h1 className="planner-text">Trip Planner</h1>
        {/* <h1 className="planner-text">Trip Planner</h1> */}
        <Search setSearchResult={setSearchResult} places={places} setPlaces={setPlaces} searchResult={searchResult} setDirections={setDirections}/>
        {places && <Itinerary places={places} setPlaces={setPlaces} setDirections={setDirections} setSearchResult={setSearchResult}/>}
        </>
    );
  }
  