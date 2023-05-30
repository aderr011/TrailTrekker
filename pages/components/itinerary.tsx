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
	Paper,
  Divider,
  ListItemText
} from "@mui/material";


import {TfiTrash} from "react-icons/tfi";
type ItineraryProps = {
  places: (Place[]);
  setPlaces: ((list: Place[]) => void);
  setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
  directions: (google.maps.DirectionsResult | undefined);
  setDirections: (result: google.maps.DirectionsResult | undefined) => void;
  routeFound: (boolean | undefined);
};

export default function Itinerary({ places, setPlaces, setSearchResult, directions, setDirections, routeFound }: ItineraryProps) {

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
      const coords:any = { lat: updatedArray[0].lat, lng: updatedArray[0].lng}
      setSearchResult(coords)
      setDirections(undefined)
    }
    if (places.length == 1) {
      setSearchResult(undefined)
      setDirections(undefined)
    }
  };
// && directions?.routes[0].legs[indexNum-1].duration

// {/* TO FIX: 
//                           I have to create another hook which can be checked which 
//                           indicates when the new directions have been allocated.
//                           Because what is happening I believe is that the place is added to the 
//                           list of places which triggers the directions api call but while we are 
//                           waiting for that response we are attempting to get the duration */}
  return (
    <div>
      <h2 className="itinerary-header">Itinerary</h2>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <List 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  sx={{ width: "100%", maxWidth: 400, maxHeight: "70vh", overflow: 'auto'}}
              >
                {places.map(({name, lat, lng}, indexNum) => {
                  console.log(indexNum)
                  return (
                    <Draggable key={name} draggableId={name} index={indexNum}>
                      {(provided) => (
                        <>
                        <Paper
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            elevation={2}
                            sx={{ marginBottom: "10px" }}
                        >

                          


                          {(indexNum>0 && (directions?.routes[0].legs.length === places.length-1)) && (
                            <>
                              <ListItemText secondary={directions?.routes[0].legs[indexNum-1].duration} sx={{position: 'relative', textAlign: 'center', top: '4px', padding: '3px'}}  />
                              <Divider variant='fullWidth'/>
                            </>
                          )}
                          
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
                        
                      </>
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
