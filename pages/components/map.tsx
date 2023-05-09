import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoBox,
  InfoWindow,
  Data,
  Circle,
  MarkerClusterer,
  useGoogleMap,
} from "@react-google-maps/api";
import TripPlanner from "./tripPlanner";
import Spots from "../api/spots";
import { Place } from "@/constants";
import askGPT from "../api/spots";

export default function Map() {
  const [searchResult, setSearchResult] = useState<google.maps.LatLngLiteral>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult>();
  const [trailResults, setTrailResults] = useState<Place[]>([]);
  const [searchTrailsLoc, setSearchTrailsLoc] = useState<google.maps.LatLngLiteral>();
  const [searchedBounds, setSearchedBounds] = useState<google.maps.LatLngBounds[]>([]);
  const [prevBounds, setPrevBounds] = useState<google.maps.LatLngBounds>();
  const [selectedTrail, setSelectedTrail] = useState<{name: string; length: string; description: string; system: string; level: string; lanes: string; id: string} | undefined>();
  const [selectedTrailLoc, setSelectedTrailLoc] = useState<any>();
  const [selectedFeature, setSelectedFeature] = useState<google.maps.Data.Feature>();


  


  const mapRef = useRef<google.maps.Map>();

  const zoom = useMemo<number>(() => (10),[]);
  const center = useMemo<google.maps.LatLngLiteral>(() => ({ lat: 40.57418050950612, lng:-105.083399099530334 }),[]);
  const options = useMemo<google.maps.MapOptions>(
    () => ({
      mapId: "dc6c5f27dbeb3eae",
      disableDefaultUI: false,
      clickableIcons: true,
    }),
    []
  );

 function areBoundsSearched( bounds: google.maps.LatLngBounds): boolean {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      console.log("Here with the bounds array being this long: " + searchedBounds.length)
    
      //Loop through all bounds and see if the current bounds are not already covered in the previous
      //Loop from the end to the start of the searchedBounds array because most likely the bound most
      //recently searched will be contained within the most recently added searchedBounds making this 
      //loop much more efficient when the searchedBounds list is very long.

      console.log("Starting to search")
      for (let i = 0; i < searchedBounds?.length; i++){
        const currBounds = searchedBounds[i] 
        if (currBounds.contains(sw) && currBounds.contains(ne))
          return true;
      }
      console.log("Stopped search")
      return false;
  }

  function onIdle() {
    const map: google.maps.Map | undefined = mapRef.current;
    const mapZoom: number | undefined = mapRef.current?.getZoom();
    const mapBounds: google.maps.LatLngBounds | undefined = mapRef.current?.getBounds();

    if (!map) return;
    if (!mapZoom) return;
    if (!mapBounds) return;
    
    const geoJsonLayer = new google.maps.Data();

   
    function isBoundsContainedWithinOther(bounds1: google.maps.LatLngBounds, bounds2: google.maps.LatLngBounds): boolean {
      const sw1 = bounds1.getSouthWest();
      const ne1 = bounds1.getNorthEast();
      const sw2 = bounds2.getSouthWest();
      const ne2 = bounds2.getNorthEast();
    
      // Check if the northeast and southwest corners of bounds1 are contained within bounds2
      return bounds2.intersects(sw1);
    }

    const loadGeoJsonData = (bounds:google.maps.LatLngBounds) => {
      const { east, north, south, west } = bounds.toJSON(); 
      if ( bounds && searchedBounds.length > 0){
        console.log("Here")
        if (areBoundsSearched(bounds)) {
          console.log("Bounds already loaded, skipping")
          return;
        }
      }
      console.log("SEARCH")

      //Add current bounds to searchedBounds array
      setSearchedBounds([...searchedBounds, bounds]);

      // Load the GeoJSON data
      console.log("Fetching the USFS data")
      const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query?where=1%3D1&outFields=IVM_SYMBOL,ID,NAME,SEG_LENGTH,SYSTEM,ROUTE_STATUS,OPER_MAINT_LEVEL,SURFACE_TYPE,LANES,COUNTY,SYMBOL_NAME&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      geoJsonLayer.loadGeoJson(queryString)
      geoJsonLayer.setStyle({
        strokeColor: '#066920',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#066920',
        fillOpacity: 0.35,
      });
      const selectedStyle = {
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        fillColor: "red",
        fillOpacity: 0.5,
      };
      
      geoJsonLayer.addListener("click", (event:google.maps.Data.MouseEvent) => {
        geoJsonLayer.overrideStyle(event.feature, selectedStyle);

        // Get the clicked feature's properties
        const name = event.feature.getProperty("NAME")
        const length = event.feature.getProperty("SEG_LENGTH")
        const description = event.feature.getProperty("SYMBOL_NAME")
        const system = event.feature.getProperty("SYSTEM")
        const level = event.feature.getProperty("OPER_MAINT_LEVEL")
        const lanes = event.feature.getProperty("LANES")
        const FSRID = event.feature.getProperty("ID")
        
        
        // Set the selected trail to the clicked feature's properties
        setSelectedTrailLoc(event.latLng);
        setSelectedTrail({name: name, length: length, description: description, system: system, level: level, lanes: lanes, id: FSRID});
      });
      console.log("Results Populated")
      
      geoJsonLayer.setMap(map);
    };

    if (mapZoom > 9) {
      loadGeoJsonData(mapBounds);
    }
    mapRef.current = map;
  }

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  },[]);

  function handleDblClick (e: google.maps.MapMouseEvent): void {
    if (!e.latLng) return;
    setSearchTrailsLoc({lat:e.latLng.lat(), lng:e.latLng.lng()});
  }

  return (
    <>
    <div className="header">
        <h1 className="header-text">TrailTrekker</h1>
    </div>
    <div className="container">
      <div className="controls">
        <TripPlanner setDirections={setDirections} searchResult={searchResult} setSearchResult={(position) => {
            setSearchResult(position);    
            // if (position) {
            //   mapRef.current?.panTo(position);
            // }        
          }}/>
      </div>
      <div className="map">
        <GoogleMap
          zoom={zoom}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
          onDblClick={handleDblClick}
          onIdle={onIdle}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}
          {selectedTrail ? (
          <InfoWindow
            position={selectedTrailLoc}
            onCloseClick={() => {
              setSelectedTrail(undefined);
            }}
          >
            <div>
              <h2>
              {selectedTrail.name}
              </h2>
              <p>Length: {selectedTrail.length}mi</p>
              <p>Number of Lanes: {selectedTrail.lanes}</p>
              <p>System: {selectedTrail.system}</p>
              <p>Forest Service Road # {selectedTrail.id}</p>
              <p>Description: {selectedTrail.description}</p>
              <p>Level: {selectedTrail.level}</p>
              
            </div>
          </InfoWindow>
        ) : null}

          {searchResult && (
            <>
              <Marker
                position={searchResult}
              />
            </>
          )}
          {trailResults && (
            <Spots searchTrailsLoc={searchTrailsLoc} setTrailResults={setTrailResults} trailResults={trailResults}/>
          )}
        </GoogleMap>
      </div>
    </div>
    </>
  );
}
