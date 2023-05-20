import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from "react";
import { Place } from "../../constants";

import {
	Avatar,
	Container,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
  TextField,
	ListItemText,
  IconButton,
  MenuItem,
  Select,
	Paper,
  Menu,
} from "@mui/material";

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


import {TfiTrash} from "react-icons/tfi";
import { AnyAaaaRecord } from 'dns';

type ItineraryProps = {
  places: (Place[]);
  setPlaces: ((list: Place[]) => void);
  setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;

};

export default function Itinerary({ places, setPlaces, setSearchResult }: ItineraryProps) {

  function handleOnDragEnd(result: any) {
    if (!result.destination) return;

    const items = Array.from(places);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlaces(items);
  }

  const removePlace = (index:any) => {
    console.log(index)
    const updatedArray = [...places]; 
    updatedArray.splice(index, 1); 
    setPlaces(updatedArray); 
  };
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (index: number, val: string) => {
    setValue(val, false);
    clearSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);
    var myPlace : Place = {name: val, lat:lat, lng:lng};
    setPlaces([...places, myPlace]);

    //NEED TO FIGIRE THIS OUT!!!!!!
    // const updatedArray = [...places];
    // updatedArray[index] = val;
    // setSearchResult({ lat, lng });
    // console.log("calling openai");
    // askGPT(myPlace);
  };

  const handleChange = (event:any) => {
    console.log(event.target.value)
    setValue(event.target.value)
  };
  const [sidebar, setSidebar] = useState(false);


  return (
    <div>
      <h2 className="itinerary-header">Itinerary</h2>
      <header>
        
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <List 
                  className="characters" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  sx={{ width: "100%", maxWidth: 360 }}
              >
                {places.map(({name, lat, lng}, indexNum) => {
                  return (
                    <Draggable key={name} draggableId={name} index={indexNum}>
                      {(provided) => (
                        <Paper
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            elevation={2}
                            sx={{ marginBottom: "10px" }}
                        >
                          <ListItem
                            secondaryAction={
                              <IconButton edge="end" aria-label="delete">
                                <TfiTrash onClick={() => removePlace(indexNum)}/>
                              </IconButton>
                            }
                          >
                          {/* <TextField
                            value={name}
                            onChange={handleChange}
                          >
                            {status === "OK" &&
                                    data.map(({ place_id, description }) => (
                                      <MenuItem key={place_id} value={description} />
                                    ))}
                          </TextField> */}



                          


                            {/* <Combobox onSelect={handleSelect(indexNum, value)}>
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
                            </Combobox> */}
                            <TextField 
                            value={name}
                            fullWidth
                            variant="outlined" 
                            />
                            {/* <ListItemText primary={name.substring(0,name.indexOf(",")).trim()} secondary={name.substring(name.indexOf(",")+1).trim()}/> */}
                          </ListItem>
                        </Paper>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </header>
    </div>
  );
}
