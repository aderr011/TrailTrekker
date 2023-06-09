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
import { Modal,Paper,Typography, 
Box } from '@mui/material';

import "@reach/combobox/styles.css";
import { Place, Campsite } from "../../constants";
import { useState, useEffect } from "react";
import  askGPT  from "../api/spots"
import PlaceIcon from '@mui/icons-material/Place';
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TextField from '@mui/material/TextField';
import TuneIcon from '@mui/icons-material/Tune';


type SearchProps = {
  setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
  setPlaces : (list: Place[]) => void;
  places : (Place[]);
  searchResult: (google.maps.LatLngLiteral | undefined);
  setDirections: (result: google.maps.DirectionsResult | undefined) => void;
  setRouteData: (data: google.maps.DirectionsLeg[] | undefined) => void;
  setSelectingPlace: (tf: boolean) => void;
  campsites: (Campsite[] | undefined);
  setCampsites: (campsites: Campsite[] | undefined) => void;
};

export default function Search({ setSearchResult, setPlaces, places, searchResult, setDirections, setSelectingPlace, setRouteData, campsites, setCampsites }: SearchProps) {
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
  const [gMapsLink, setGMapsLink] = useState<string>();
 
  useEffect(() => {
    const placesNoName = places.map((place) => ({
      lat: place.lat,
      lng: place.lng,
    }));

    if(places[0]){
      let mapsLink:(string|undefined) = generateGoogleMapsLink(places[0].name, places[places.length-1].name, places.slice(1, places.length-1))
      setGMapsLink(mapsLink)
    }
    
    setPlacesLatLng(placesNoName);
    fetchDirections(placesNoName);
  }, [places]);


  const fetchDirections = (placesLocs: google.maps.LatLngLiteral[]) => {
    if (placesLocs.length < 2) return;

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
          
          setRouteData(result.routes[0].legs)
          setDirections(result);
          setSearchResult(undefined);
        }
      }
    );
  };

  // async function getCampingSpots (searchPlace: Place) {
  //   if (!searchPlace) return;

  //   console.log("When sending")
  //   console.log(searchPlace.name);
  //   console.log(searchPlace.lat + ", " + searchPlace.lng);

  //   try {
  //     const response = await fetch("/api/generate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ coordinates: "(" + searchPlace.lat + ", " + searchPlace.lng + ")", address: searchPlace.name }),
  //     });

  //     const data = await response.json();
  //     if (response.status !== 200) {
  //       throw data.error || new Error(`Request failed with status ${response.status}`);
  //     }

  //     console.log(data.result);
  //   } catch(error:any) {
  //     // Consider implementing your own error handling logic here
  //     console.error(error);
  //     alert(error.message);
  //   }
  // }

  const handleSelect = async (val: string) => {
    setValue("", false);
    clearSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);
    myPlace = {name: val, lat:lat, lng:lng};
    setPlaces([...places, myPlace]);
    
    setSearchResult({ lat, lng });
    // console.log("calling openai");
    // askGPT(myPlace);
  };
  function handlePlaceClick (): void {
    setSelectingPlace(true);
  }

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "35%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    zIndex: 9999999999999999999,
};

function generateGoogleMapsLink(start: string, end: string, waypoints: Place[]) {
  if (!start || !end) return;
  const baseUrl:string = "https://www.google.com/maps/dir/";
  console.log(waypoints);
  const waypointStr:string = waypoints.map((wp: any) => `${wp.lat},${wp.lng}`).join('/');
  const startStr:string = start.replace(/ /g, '+');
  const destStr:string = end.replace(/ /g, "+");

  return `${baseUrl}${startStr}/${waypointStr}/${destStr}`;
}

function handleCopy() {
  if(!gMapsLink) return
  navigator.clipboard.writeText(gMapsLink)
  .then(() => {
    alert('Text copied to clipboard');
  })
  .catch(err => {
    alert('Error occurred while copying text to clipboard: ');
  });
}

  return (
    <div className="search">  
    <Combobox style={{width:'100%'}} onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }
        }

        disabled={!ready}
        className="combobox-input"
        placeholder="Search Location"
      />
      <ComboboxPopover style={{zIndex:999999}}>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
    <PlaceIcon sx={{marginLeft: '10px'}} onClick={handlePlaceClick}/>
    <IosShareIcon  onClick={()=>setOpen(!open)} sx={{marginLeft: '10px'}}/>
    <TuneIcon onClick={()=>{
      let dispersed = campsites.filter(campsite => campsite.properties.TYPE.includes("CAMPING UNIT"));
      setCampsites(dispersed);
    }} 
    sx={{marginLeft: '10px'}}/>
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={ style}>
        <Typography variant="h6" component="h2">
            Google Maps Link
          </Typography>
          <br/>
        <TextField
        style={{width:"100%"}}
        value={gMapsLink}
        InputProps={{endAdornment: <ContentCopyIcon onClick={handleCopy}/>}}
      />
          
        </Box>
      </Modal>
    </div>
    </div>

  );
}
