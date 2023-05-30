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
import { LargeNumberLike } from "crypto";
import * as FaIcons from 'react-icons/fa';
import { Squeeze as Hamburger } from 'hamburger-react'


export default function GMap() {
  const [searchResult, setSearchResult] = useState<google.maps.LatLngLiteral>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | undefined>(undefined);
  // const [directionsCalculated, setDirectionsCalculated] = useState<boolean>(false);
  const [trailResults, setTrailResults] = useState<Place[]>([]);
  const [searchTrailsLoc, setSearchTrailsLoc] = useState<google.maps.LatLngLiteral>();
  const [searchedBounds, setSearchedBounds] = useState<google.maps.LatLngBounds[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<{name: string; length: number; description: string; system: string; level: string; forest: string; dateRange: string, allowedVehicles: string|undefined} | undefined>();
  const [selectedTrailLoc, setSelectedTrailLoc] = useState<any>();

  const mapRef = useRef<google.maps.Map>();

  const zoom = useMemo<number>(() => (10),[]);
  const center = useMemo<google.maps.LatLngLiteral>(() => ({ lat: 40.57418050950612, lng:-105.083399099530334 }),[]);
  const options = useMemo<google.maps.MapOptions>(
    () => ({
      mapId: "dc6c5f27dbeb3eae",
      disableDefaultUI: false,
      clickableIcons: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      fullscreenControl: false,
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

      // const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query?where=1%3D1&outFields=NAME,SEG_LENGTH,SYSTEM,ROUTE_STATUS,OPER_MAINT_LEVEL,SURFACE_TYPE,LANES,COUNTY,GIS_MILES,IVM_SYMBOL,SYMBOL_NAME,ID&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_01/MapServer/1/query?where=1%3D1&outFields=NAME,GIS_MILES,JURISDICTION,OPERATIONALMAINTLEVEL,PASSENGERVEHICLE,PASSENGERVEHICLE_DATESOPEN,SECURITYID,SBS_SYMBOL_NAME,FORESTNAME,MOTORHOME,ATV,BUS,MOTORCYCLE,OTHER_OHV_LT50INCHES&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      // const campgrounds = `https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/query?where=1%3D1&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      geoJsonLayer.loadGeoJson(queryString)
      // geoJsonLayer.loadGeoJson(campgrounds)

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
        const feature = event.feature;
        geoJsonLayer.overrideStyle(feature, selectedStyle);

        const name: string = feature.getProperty("NAME")
        const length: number = Math.round(Number(feature.getProperty("GIS_MILES")))
        const description: string = feature.getProperty("SBS_SYMBOL_NAME")
        const system: string = feature.getProperty("JURISDICTION")
        const level: string = feature.getProperty("OPERATIONALMAINTLEVEL")
        const dateRange: string = feature.getProperty("PASSENGERVEHICLE_DATESOPEN")
        const forestName: string = feature.getProperty("FORESTNAME")

        // Check the different vehicles that are allowed on trail
        let variables = new Map<string, string>([
          ["Car", feature.getProperty("PASSENGERVEHICLE")],
          ["Bus", feature.getProperty("BUS")],
          ["Motorhome", feature.getProperty("MOTORHOME")],
          ["ATV", feature.getProperty("ATV")],
          ["Motorcycle", feature.getProperty("MOTORCYCLE")],
          ["Other OHV vehicles", feature.getProperty("OTHER_OHV_LT50INCHES")]
        ]);

        let allowedVehicles: string = "not listed";
        variables.forEach((value, key) => {
          if (value === "open") {
            if (allowedVehicles == "not listed") allowedVehicles = key
            else allowedVehicles = allowedVehicles + ", " + key
          }
        });

        // Set the selected trail to the clicked feature's properties
        setSelectedTrailLoc(event.latLng);
        setSelectedTrail({name: name, length: length, description: description, system: system, level: level, forest: forestName, dateRange: dateRange, allowedVehicles: allowedVehicles});
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
  const [sidebar, setSidebar] = useState(true);

  return (
    <div className="container">

      <div className="header">
        <Hamburger label="Show Trip Planner" color="white" size={25} toggled={sidebar} toggle={setSidebar} />
        <h1>TrailTrekker</h1>
      </div>
      
      
      <div id="map">
        <div className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <TripPlanner directions={directions} setDirections={setDirections} searchResult={searchResult} setSearchResult={(position) => {
              setSearchResult(position);         
            }}/>
        </div>
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
                <p>Forest: {selectedTrail.forest}</p>
                <p>System: {selectedTrail.system}</p>
                <p>Dates Open: {selectedTrail.dateRange}</p>
                <p>Description: {selectedTrail.description}</p>
                <p>Level: {selectedTrail.level}</p>
                <p>Vehicles Allowed: {selectedTrail.allowedVehicles}</p>
              </div>
            </InfoWindow>
          ) : null}

            {(searchResult && !directions) && (
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
  );
}
