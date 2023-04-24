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
  
  type PlacesProps = {
    setSearchResult: (position: google.maps.LatLngLiteral) => void;
    setLatLngList : ((list: google.maps.LatLngLiteral[]) => void);
    latLngList : (google.maps.LatLngLiteral[]);
  };
  
  export default function Places({ setSearchResult, setLatLngList, latLngList }: PlacesProps) {
    const {
      ready,
      value,
      setValue,
      suggestions: { status, data },
      clearSuggestions,
    } = usePlacesAutocomplete();
  
    const handleSelect = async (val: string) => {
      setValue(val, false);
      clearSuggestions();
  
      const results = await getGeocode({ address: val });
      const { lat, lng } = await getLatLng(results[0]);
      //Add this lat lng set to a list that we can then display below the search bar
      latLngList.push({lat, lng});
      setLatLngList(latLngList);
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
  