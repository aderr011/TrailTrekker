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
  
	Paper,
} from "@mui/material";


import {TfiTrash} from "react-icons/tfi";
import { AnyAaaaRecord } from 'dns';

type ItineraryProps = {
  places: (Place[]);
  setPlaces: ((list: Place[]) => void);
};

export default function Itinerary({ places, setPlaces }: ItineraryProps) {

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

  return (
    <div>
      <header>
        <h2 className="itinerary-header">Itinerary</h2>
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
                            <TextField 
                            value={name}
                            fullWidth
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
