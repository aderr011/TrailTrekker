import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
  import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
  } from "@reach/combobox";
  import "@reach/combobox/styles.css";
  import { Place } from "../constants";
  import { useState, useEffect } from "react";

  
  type SearchProps = {
    setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
    setPlaces : ((list: Place[]) => void);
    places : (Place[]);
    searchResult: (google.maps.LatLngLiteral | undefined);
    setDirections: (result: google.maps.DirectionsResult | undefined) => void;
  };
  
  export default function Search({ setSearchResult, setPlaces, places, searchResult, setDirections }: SearchProps) {
    var myPlace : Place;
    const {
      ready,
      value,
      setValue,
      suggestions: { status, data },
      clearSuggestions,
    } = usePlacesAutocomplete();

    const[ placesLatLng, setPlacesLatLng] = useState<google.maps.LatLngLiteral[]>([]);
    useEffect(() => {
      const placesNoName = places.map((place) => ({
        lat: place.lat,
        lng: place.lng,
      }));
      setPlacesLatLng(placesNoName);
    }, [places]);


    const fetchDirections = (placesLocs: google.maps.LatLngLiteral[]) => {
      console.log("The start: " + placesLocs[0].lat + ", " + placesLocs[0].lng);
      console.log("The destination: " + placesLocs[placesLocs.length-1].lat + ", " + placesLocs[placesLocs.length-1].lng);
      if (!searchResult) return;
  
      //must convert into DirectionsWaypoints
      const inBetweenPlaces = placesLocs.slice(1, placesLocs.length-1).map((place) => {
        return {
          location: new google.maps.LatLng(place.lat, place.lng),
        };
      });
  
      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: placesLocs[0],
          destination: placesLocs[placesLocs.length-1],
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

  
    const handleSelect = async (val: string) => {
      setValue(val, false);
      clearSuggestions();

      const results = await getGeocode({ address: val });
      const { lat, lng } = await getLatLng(results[0]);
      myPlace = {name: val, lat:lat, lng:lng};
      places.push(myPlace);
      setPlaces(places);
      setSearchResult({ lat, lng });
      fetchDirections(placesLatLng);
    };
  
    return (
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="combobox-input"
          placeholder="Search Location"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    );
  }
  