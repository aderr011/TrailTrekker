const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


type ItineraryProps = {
  latLngList: (google.maps.LatLngLiteral[]);
  setLatLngList: ((list: google.maps.LatLngLiteral[]) => void);
};

export default function Itinerary({ latLngList, setLatLngList }: ItineraryProps) {

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(places);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLatLngList(items);
  }

  var i = 0;
  const places = latLngList.map((latLng) => {
    id: i++;

  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Final Space Characters</h1>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <ul className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                {places.map(({lat, lng}, index) => {
                  return (
                    <Draggable key={lat} draggableId={lat} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="characters-thumb">
                            <img src={thumb} alt={`${name} Thumb`} />
                          </div>
                          <p>
                            { name }
                          </p>
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
      <p>
        Images from <a href="https://final-space.fandom.com/wiki/Final_Space_Wiki">Final Space Wiki</a>
      </p>
    </div>
  );







  if (!leg.distance || !leg.duration) return null;

  const days = Math.floor(
    (commutesPerYear * leg.duration.value) / secondsPerDay
  );
  const cost = Math.floor(
    (leg.distance.value / 1000) * litreCostKM * commutesPerYear
  );

  return (
    <div>
      <p>
        This home is <span className="highlight">{leg.distance.text}</span> away
        from your office. That would take{" "}
        <span className="highlight">{leg.duration.text}</span> each direction.
      </p>

      <p>
        That's <span className="highlight">{days} days</span> in your car each
        year at a cost of{" "}
        <span className="highlight">
          ${new Intl.NumberFormat().format(cost)}
        </span>
        .
      </p>
    </div>
  );
}
