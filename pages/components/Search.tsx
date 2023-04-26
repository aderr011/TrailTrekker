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
  import { Place } from "../../constants";
  import { useState, useEffect } from "react";
  import sendRequest from "../api/generate";

  type SearchProps = {
    setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
    setPlaces : (list: Place[]) => void;
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

    const[ result, setResult] = useState<string>("");
    const[ placesLatLng, setPlacesLatLng] = useState<google.maps.LatLngLiteral[]>([]);
    useEffect(() => {
      console.log("HERE IN THE USEEFFECT")
      console.log(places);
      const placesNoName = places.map((place) => ({
        lat: place.lat,
        lng: place.lng,
      }));
      setPlacesLatLng(placesNoName);
      fetchDirections(placesNoName);
    }, [places]);


    const fetchDirections = (placesLocs: google.maps.LatLngLiteral[]) => {
      if (placesLocs.length == 0) {
        console.log("something wrong");
        return;
      }

      //Convert into DirectionsWaypoints
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
            console.log("We set the directions with: ");
            console.log(placesLocs);
            setDirections(result);
          }
        }
      );
    };

    async function getCampingSpots (searchPlace: Place) {
      if (!searchPlace) return;
      console.log("When sending")
      console.log(searchPlace.name);
      console.log(searchPlace.lat + ", " + searchPlace.lng);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coordinates: "(" + searchPlace.lat + ", " + searchPlace.lng + ")", address: searchPlace.name }),
        });
  
        const data = await response.json();
        if (response.status !== 200) {
          throw data.error || new Error(`Request failed with status ${response.status}`);
        }
  
        console.log(data.result);
      } catch(error:any) {
        // Consider implementing your own error handling logic here
        console.error(error);
        alert(error.message);
      }
    }
  
    const handleSelect = async (val: string) => {
      setValue(val, false);
      clearSuggestions();

      const results = await getGeocode({ address: val });
      const { lat, lng } = await getLatLng(results[0]);
      myPlace = {name: val, lat:lat, lng:lng};
      setPlaces([...places, myPlace]);
      setSearchResult({ lat, lng });
      console.log("calling openai");
      getCampingSpots(myPlace);
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
  