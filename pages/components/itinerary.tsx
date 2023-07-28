import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast, ToastContainer } from 'react-toastify';
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
  ListItemText,
  Avatar
} from "@mui/material";


import {TfiTrash} from "react-icons/tfi";
type ItineraryProps = {
  places: (Place[]);
  setPlaces: ((list: Place[]) => void);
  setSearchResult: (position: google.maps.LatLngLiteral | undefined) => void;
  setDirections: (result: google.maps.DirectionsResult | undefined) => void;
  routeData: (google.maps.DirectionsLeg[] | undefined);
};

export default function Itinerary({ places, setPlaces, setSearchResult, setDirections, routeData}: ItineraryProps) {

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

  return (
    <div>
      <h2 className="itinerary-header">Itinerary</h2>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <List 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="itinarary-items"
              >
                {places.map(({name, lat, lng}, indexNum) => {
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

                          {(indexNum>0 && routeData && places.length-1 === routeData.length) && (
                            <>
                              <ListItemText secondary={routeData[indexNum-1].duration?.text} sx={{position: 'relative', textAlign: 'center', top: '4px', padding: '3px'}}  />
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
                            <Avatar sx={{ bgcolor: "#f23d3d" }}>{String.fromCharCode(65+indexNum)}</Avatar>
                            
                            <TextField 
                              sx={{paddingLeft: "15px"}}
                              value={name}
                              fullWidth
                              variant="outlined" 
                            />
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
