import { useState, useMemo, useCallback, useRef } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
  import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    Circle,
    MarkerClusterer,
  } from "@react-google-maps/api";

  import "@reach/combobox/styles.css";
  import Search from "./Search";
  import Itinerary from "./itinerary";
  import { Place } from "../constants";


  
  type TripPlannerProps = {
    setSearchResult: (position: google.maps.LatLngLiteral) => void;
    // searchResult: (google.maps.LatLngLiteral);

  };
  
  export default function TripPlanner({ setSearchResult }: TripPlannerProps) {
    

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
        <h1>Trip Planner</h1>
        {/* <Places setPlaces={(position) => {
            setSearchResult(position);
            console.log(position);
          }}/> */}
        <Search
          setSearchResult={setSearchResult} places={places} setPlaces={setPlaces}/>
        
        {/* {searchResult && <Itinerary></>} */}
        {places && <Itinerary places={places} setPlaces={setPlaces} />}
        </>
    );
  }
  