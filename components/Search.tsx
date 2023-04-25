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
            console.log("We set the directions with: ");
            console.log(placesLocs);
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
      //The below set does not seem to be setting the places array because it 
      //does not call the useEffect. But when you actually go into the list and
      //change the order of the lists then you actually see the places change
      setPlaces([...places, myPlace]);

      setSearchResult({ lat, lng });
      
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
  