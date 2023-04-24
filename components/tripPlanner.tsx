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
  import Places from "./places";
  import Itinerary from "./itinerary";


  
  type PlacesProps = {
    setSearchResult: (position: google.maps.LatLngLiteral) => void;
    // searchResult: (google.maps.LatLngLiteral);

  };
  
  export default function TripPlanner({ setSearchResult }: PlacesProps) {
    const [places, setPlaces] = useState<google.maps.LatLngLiteral[]>([]);

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
        <Places
          setSearchResult={setSearchResult} setPlaces((position) => {
            setPlaces((prevPlaces: google.maps.LatLngLiteral[]) => [...prevPlaces, position]);
            console.log("something");
          })/>
        {!searchResult && <p>Enter the address of your office.</p>}
        {/* {searchResult && <Itinerary></>} */}
        {directions && <Itinerary leg={directions.routes[0].legs[0]} />}
        </>
    );
  }
  