import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from "react";



type ItineraryProps = {
  latLngList: (google.maps.LatLngLiteral[]);
  setLatLngList: ((list: google.maps.LatLngLiteral[]) => void);
};

export default function Itinerary({ latLngList, setLatLngList }: ItineraryProps) {

  if (latLngList[0]){
    console.log("Recieving here: " + latLngList[0].lat);
  }

  const [listWithIds, setListWithIds] = useState<{ id: string; lat: number; lng: number; }[]>([
    {
      id: "1", 
      lat: 40,
      lng: 45,
    },
    {
      id: "2", 
      lat: 100,
      lng: 45,
    },
    {
      id: "3", 
      lat: 5,
      lng: 45,
    },
    {
      id: "4", 
      lat: 0,
      lng: 100,
    },
    {
      id: "5", 
      lat: 45,
      lng: 55,
    },
    {
      id: "6", 
      lat: 50,
      lng: -100,
    }
  ]);
  
  // useEffect(() => {
  //   const newListWithIds = latLngList.map((latLng, index) => {
  //     return {
  //       id: `${index}`,
  //       lat: latLng.lat,
  //       lng: latLng.lng,
  //     };
  //   });
  //   setListWithIds(newListWithIds);
  // }, [latLngList]);

  function handleOnDragEnd(result: any) {
    if (!result.destination) return;

    const items = Array.from(listWithIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setListWithIds(items);
  }
  

  return (
    <div>
      <header>
        <h1>Stops</h1>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <ul className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                {listWithIds.map(({id, lat, lng}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="characters-thumb">
                            <h3>id: {id} lat: {lat} long: {lng}</h3>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </header>
    </div>
  );
}
