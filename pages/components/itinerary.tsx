import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from "react";
import { Place } from "../../constants";
import MenuIcon from '@mui/icons-material/Menu';
import {
	List,
	ListItem,
	ListItemIcon,
  TextField,
  IconButton,
	Paper
} from "@mui/material";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {TfiTrash} from "react-icons/tfi";
type ItineraryProps = {
  places: (Place[]);
  setPlaces: ((list: Place[]) => void);
  setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
  setDirections: (result: google.maps.DirectionsResult | undefined) => void;
};

export default function Itinerary({ places, setPlaces, setSearchResult, setDirections }: ItineraryProps) {

  function handleOnDragEnd(result: any) {
    if (!result.destination) return;

    const items = Array.from(places);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlaces(items);
  }

  const removePlace = (index:any) => {
    const updatedArray = [...places]; 
    updatedArray.splice(index, 1); 
    setPlaces(updatedArray); 
    if (places.length == 2) {
      const coords:google.maps.LatLngLiteral = {lat: updatedArray[0].lat, lng: updatedArray[0].lng}
      setSearchResult(coords)
      setDirections(undefined)
    }
  };

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleChange = (event:any) => {
    console.log(event.target.value)
    setValue(event.target.value)
  };

  return (
    <div>
      <h2 className="itinerary-header">Itinerary</h2>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <List 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  sx={{ width: "100%", maxWidth: 400, maxHeight: "63vh", overflow: 'auto' }}
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
                            <ListItemIcon>
                              <MenuIcon/>
                            </ListItemIcon>
                            
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
    </div>
  );
}
