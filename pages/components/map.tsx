import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import TripPlanner from "./tripPlanner";
import { Place } from "@/constants";
import askGPT from "../api/spots";

export default function Map() {
  // const [office, setOffice] = useState<google.maps.LatLngLiteral>();
  const [searchResult, setSearchResult] = useState<google.maps.LatLngLiteral>();
  const [places, setPlaces] = useState<google.maps.LatLngLiteral[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult>();
  const [trailResults, setTrailResults] = useState<Place[]>([]);
  const [searchTrailsLoc, setSearchTrailsLoc] = useState<google.maps.LatLngLiteral>();
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<google.maps.LatLngLiteral>(
    () => ({ lat: 40.572828, lng: -105.085134 }),
    []
  );
  const options = useMemo<google.maps.MapOptions>(
    () => ({
      mapId: "dc6c5f27dbeb3eae",
      disableDefaultUI: false,
      clickableIcons: true,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const houses = useMemo(() => generateHouses(center), [center]);

  const fetchDirections = (houses: google.maps.LatLngLiteral[]) => {
    console.log("The start: " + houses[0].lat + ", " + houses[0].lng);
    console.log("The destination: " + houses[houses.length-1].lat + ", " + houses[houses.length-1].lng);
    if (!searchResult) return;

    //must convert into DirectionsWaypoints
    const inBetweenPlaces = houses.slice(1, houses.length-1).map((house) => {
      return {
        location: new google.maps.LatLng(house.lat, house.lng),
      };
    });

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: houses[0],
        destination: houses[houses.length-1],
        waypoints: inBetweenPlaces,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        }
      }
    );
  };

  function handleDblClick (e: google.maps.MapMouseEvent): void {
    //Could set some prop to true that would create a pop-up that 
    //is like a loading bar that says loading trails

    //In the current implementation (being this calling the openAI API)
    //There is no way of passing the address to GPT so it may be less 
    //precise as it could be
    if (!e.latLng) return;
    //Set a hook that will then be checked in the Spots file
    setSearchTrailsLoc({lat:e.latLng.lat(), lng:e.latLng.lng()});
  }

  return (
    <>
    <div className="header">
        <h1 className="header-text">TrailTrekker</h1>
    </div>
    <div className="container">
      <div className="controls">
        <TripPlanner setDirections={setDirections} searchResult={searchResult} setSearchResult={(position) => {
            setSearchResult(position);    
            if (position) {
              mapRef.current?.panTo(position);
            }        
          }}/>
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
          onDblClick={handleDblClick}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {searchResult && (
            <>
              <Marker
                position={searchResult}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />
            </>
          )}
          {/* Maybe you can move the below component into the spots.tsx file 
          and move that out of the API path and then pass the prop down to that?? */}
          {trailResults && (
            
          )}
        </GoogleMap>
      </div>
    </div>
    </>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: google.maps.LatLngLiteral) => {
  const _houses: Array<google.maps.LatLngLiteral> = [];
  for (let i = 0; i < 10; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};
