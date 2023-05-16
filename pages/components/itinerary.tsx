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
	ListItemText,
  IconButton,
  
	Paper,
} from "@mui/material";


import {GrClose} from "react-icons/gr";

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

  const removePlace = (index) => {
    setPlaces((prevList:Place[]) => {
      const newList = [...prevList];
      newList.splice(index, 1);
      return newList;
    });
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
                                <GrClose onClick={()=>{[...places].slice(indexNum,1)}}/>
                              </IconButton>
                            }
                          >
                            <ListItemText primary={name} secondary={"(" + lat + ", " + lng + ")"}/>
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
