import { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

  import "@reach/combobox/styles.css";
  import Search from "./Search";
  import Itinerary from "./itinerary";
  import { Place, Campground } from "../utils/types";
  
  type TripPlannerProps = {
    setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
    searchResult: (google.maps.LatLngLiteral | undefined);
    directions: (google.maps.DirectionsResult | undefined);
    setDirections: (result: google.maps.DirectionsResult | undefined) => void;
    places: (Place[]);
    setPlaces : (list: Place[]) => void;
    setSelectingPlace: (tf: boolean) => void;
    campgrounds: (Campground[] | undefined);
    setCampgrounds: (campgrounds: Campground[] | undefined) => void;
    showCampgrounds: (boolean);
    setShowCampgrounds: (fort: boolean) => void;
    showDispersedCampsites: (boolean);
    setShowDispersedCampsites: (fort: boolean) => void;
  };
  
  export default function TripPlanner({ setSearchResult, searchResult, directions, places, setPlaces, setSelectingPlace, setDirections, campgrounds, setCampgrounds, showCampgrounds, setShowCampgrounds, showDispersedCampsites, setShowDispersedCampsites }: TripPlannerProps) {
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
        <Search setSearchResult={setSearchResult} 
                places={places} 
                setPlaces={setPlaces} 
                searchResult={searchResult} 
                setSelectingPlace={setSelectingPlace}
                setDirections={setDirections}
                setRouteData={(data) => {
                  setRouteData(data)         
                }}
                setCampgrounds={setCampgrounds}
                campgrounds={campgrounds}
                showCampgrounds={showCampgrounds}
                setShowCampgrounds={setShowCampgrounds}
                showDispersedCampsites={showDispersedCampsites}
                setShowDispersedCampsites={setShowDispersedCampsites}
        />

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
  