import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
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

    const loadGeoJsonData = (bounds:google.maps.LatLngBounds) => {
      const { east, north, south, west } = bounds.toJSON();
      //This code is very inefficient... It queries for data on every move of the map.
      //I need to optimize this in some way...One possibility could be to store the previous bounds 
      //This previous query could be checked against the new bounds. 
      //If the current query's bounds fall within the previous query we do not send it
      //If the current query's bounds fall 
      console.log("Fetching the USFS data")
      const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query?where=1%3D1&outFields=NAME,SEG_LENGTH,SYSTEM,ROUTE_STATUS,OPER_MAINT_LEVEL,SURFACE_TYPE,LANES,COUNTY,SYMBOL_NAME&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      // Load the GeoJSON data
      geoJsonLayer.loadGeoJson(queryString)
      geoJsonLayer.setStyle({
            strokeColor: '#066920',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            fillColor: '#066920',
            fillOpacity: 0.35,
          });
      console.log("Results Populated")
      // const toMatch = "3 - SUITABLE FOR PASSENGER CARS"
      // var count = 0;
      // geoJsonLayer.addListener('addfeature', (evt:any) => {
      //   if (evt.feature.getProperty('OPER_MAINT_LEL') == toMatch) {
      //     count++
      //     var regionCircle = new google.maps.Circle({
      //       center: evt.feature.getGeometry().get,
      //       strokeColor: '#FF0000',
      //       strokeOpacity: 0.8,
      //       strokeWeight: 2,
      //       fillColor: '#FF0000',
      //       fillOpacity: 0.35,
      //       radius: 500,
      //       map: map
      //     });
      //   }
      // });
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
            if (position) {
              mapRef.current?.panTo(position);
            }        
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
