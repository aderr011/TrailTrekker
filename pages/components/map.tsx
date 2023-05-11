import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
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
  const [selectedTrail, setSelectedTrail] = useState<{name: string; length: string; description: string; system: string; level: string; lanes: string; id: string} | undefined>();
  const [selectedTrailLoc, setSelectedTrailLoc] = useState<any>();

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

  function onIdle() {
    const map: google.maps.Map | undefined = mapRef.current;
    const mapZoom: number | undefined = mapRef.current?.getZoom();
    const mapBounds: google.maps.LatLngBounds | undefined = mapRef.current?.getBounds();

    if (!map) return;
    if (!mapZoom) return;
    if (!mapBounds) return;

    const geoJsonLayer = new google.maps.Data();

    function areBoundsSearched( bounds: google.maps.LatLngBounds): boolean {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
    
      //Loop through all bounds and see if the current bounds are not already covered in the previous
      //Loop from the end to the start of the searchedBounds array because most likely the bound most
      //recently searched will be contained within the most recently added searchedBounds making this 
      //loop much more efficient when the searchedBounds list is very long.

      for (let i = 0; i < searchedBounds?.length; i++){
        const currBounds = searchedBounds[i] 
        if (currBounds.contains(sw) && currBounds.contains(ne))
          return true;
      }
      return false;
    }
    
    if (mapZoom > 9) {
      const { east, north, south, west } = mapBounds.toJSON(); 

      if ( mapBounds && searchedBounds.length > 0) {
        if (areBoundsSearched(mapBounds)) return;
      }

      //Add current bounds to searchedBounds array
      setSearchedBounds([...searchedBounds, mapBounds]);

      const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query?where=1%3D1&outFields=NAME,SEG_LENGTH,SYSTEM,ROUTE_STATUS,OPER_MAINT_LEVEL,SURFACE_TYPE,LANES,COUNTY,GIS_MILES,IVM_SYMBOL,SYMBOL_NAME,ID&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      
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
      geoJsonLayer.setMap(map);
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
