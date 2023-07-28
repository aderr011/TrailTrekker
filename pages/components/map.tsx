import { useState, useMemo, useCallback, useRef } from "react";
import React from 'react';
import { toast, ToastContainer, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import TripPlanner from "./tripPlanner";
import Spots from "../api/spots";
import { Place, Campground, DispersedCampsite, SitesStructure, TrailInfo } from "@/constants";
import askGPT from "../api/spots";
import { LargeNumberLike } from "crypto";
import * as FaIcons from 'react-icons/fa';
import { Squeeze as Hamburger } from 'hamburger-react'
import AddIcon from '@mui/icons-material/Add';

export default function GMap() {
  const [searchResult, setSearchResult] = useState<google.maps.LatLngLiteral>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | undefined>(undefined);
  const [selectingPlace, setSelectingPlace] = useState<boolean>(false);
  const [selectedLatLng, setSelectedLatLng] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const usePlaces = (): [Place[], (list: Place[]) => void] => {
    const [list, setList] = useState<Place[]>([]);
  
    return [list, setList];
  };
  const [places, setPlaces] = usePlaces();

  // const [directionsCalculated, setDirectionsCalculated] = useState<boolean>(false);
  const [trailResults, setTrailResults] = useState<Place[]>([]);
  const [searchTrailsLoc, setSearchTrailsLoc] = useState<google.maps.LatLngLiteral>();
  const [searchedBounds, setSearchedBounds] = useState<google.maps.LatLngBounds[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<TrailInfo | undefined>();
  const [selectedTrailLoc, setSelectedTrailLoc] = useState<google.maps.LatLng | undefined>();
  const [selectedCampsite, setSelectedCampsite] = useState<DispersedCampsite | undefined>();
  const [selectedCampground, setSelectedCampground] = useState<Campground | undefined>();
  const [campgrounds, setCampgrounds] = useState<Campground[]>();
  const [dispersedCampsites, setDispersedCampsites] = useState<DispersedCampsite[]>();
  const [sidebar, setSidebar] = useState(false);
  const [showDispersedCampsites, setShowDispersedCampsites] = useState<boolean>(true);
  const [showCampgrounds, setShowCampgrounds] = useState<boolean>(true);
  const toastId = React.useRef<Id | undefined>(undefined);


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
        if (areBoundsSearched(mapBounds)) {
          return
        }
      }
      toastId.current = toast.info("Loading trails", {autoClose:1200});

      //Add current bounds to searchedBounds array
      setSearchedBounds([...searchedBounds, mapBounds]);

      // const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query?where=1%3D1&outFields=NAME,SEG_LENGTH,SYSTEM,ROUTE_STATUS,OPER_MAINT_LEVEL,SURFACE_TYPE,LANES,COUNTY,GIS_MILES,IVM_SYMBOL,SYMBOL_NAME,ID&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      const queryString = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_01/MapServer/1/query?where=1%3D1&outFields=NAME,GIS_MILES,JURISDICTION,OPERATIONALMAINTLEVEL,PASSENGERVEHICLE,PASSENGERVEHICLE_DATESOPEN,SECURITYID,SBS_SYMBOL_NAME,FORESTNAME,MOTORHOME,ATV,BUS,MOTORCYCLE,OTHER_OHV_LT50INCHES&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      // const campgrounds = `https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/query?where=1%3D1&geometry=${west}%2C${south}%2C${east}%2C${north}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`
      geoJsonLayer.loadGeoJson(queryString)
      // geoJsonLayer.loadGeoJson("https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/0/query?where=1%3D1&outFields=SITE_NAME&&f=geojson")
      // geoJsonLayer.loadGeoJson('/campsites.geojson')
      // geoJsonLayer.loadGeoJson(campgrounds)
      
      geoJsonLayer.setStyle({
        icon: "/camp-icon.png",
        strokeColor: '#066920',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#066920',
        fillOpacity: 0.35,
      });
      const selectedStyle = {
        icon: "/camp-icon.png",
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        fillColor: "red",
        fillOpacity: 0.5,
      };
      
      geoJsonLayer.addListener("click", (event:google.maps.Data.MouseEvent) => {
        const feature = event.feature;
        geoJsonLayer.overrideStyle(feature, selectedStyle);

        let name: string = feature.getProperty("NAME")
        const length: number = Math.round(Number(feature.getProperty("GIS_MILES")))
        let description: string = feature.getProperty("SBS_SYMBOL_NAME")
        const system: string = feature.getProperty("JURISDICTION")
        const level: string = feature.getProperty("OPERATIONALMAINTLEVEL")
        const dateRange: string = feature.getProperty("PASSENGERVEHICLE_DATESOPEN")
        const forestName: string = feature.getProperty("FORESTNAME")


        let lat: number;
        let lng: number;
        if (feature.getGeometry()?.g.length > 1){
          lat = feature.getGeometry()?.getAt(0).lat()
          lng = feature.getGeometry()?.getAt(0).lng()
        }
        else {
          name = feature.getProperty("title")
          description = feature.getProperty("notes")
          lat = feature.getProperty("latitude")
          lng = feature.getProperty("longitude")
        }
        
        const coords: google.maps.LatLngLiteral = {lat:lat, lng:lng}

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

        const selectedTrail: TrailInfo = {name: name, 
                                          length: length, 
                                          description: description, 
                                          system: system, 
                                          level: level, 
                                          forest: forestName, 
                                          dateRange: dateRange, 
                                          allowedVehicles: allowedVehicles,
                                          coordinates: coords }
        setSelectedTrail(selectedTrail);
      });
      geoJsonLayer.setMap(map);
      
    }
    mapRef.current = map;
  }

  const fetchCampgrounds = async () => {
    const baseURL =
      "https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/0/query?where=1%3D1&outFields=FID,SITE_NAME,TYPE,QUANTITY,AGENCY&resultRecordCount=2000&f=geojson"

    let resultOffset = 0;
    let allResults: Campground[] = [];
    let hasMore = true;
  
    while (hasMore) {
      const response = await fetch(`${baseURL}&resultOffset=${resultOffset.toString()}`);
      // const response = await fetch(baseURL)
      const data = await response.json();
  
      allResults = [...allResults, ...data.features];
  
      // If 'exceededTransferLimit' is true, there are more records to fetch
      hasMore = (data.properties) ? data.properties.exceededTransferLimit : false
      
      if (hasMore) {
        resultOffset += 2000; // Increment resultOffset by resultRecordCount to fetch the next batch
      }
    }
    return allResults;
  };

  const fetchDispersedCampsites = async() => {
    const response = await fetch("/dispersed_campsites.geojson");

    const data = await response.json();

    return data.features
  }

  const onLoad = useCallback((map) => {
    mapRef.current = map;

    fetchDispersedCampsites()
      .then((results) => setDispersedCampsites(results))
      .catch((err) => console.log(err));

    fetchCampgrounds()
      .then((results) => setCampgrounds(results))
      .catch((err) => console.log(err));
      
    

    // fetch('https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/Campgrounds_(BLM_and_USFS)/FeatureServer/0/query?where=1%3D1&outFields=FID,SITE_NAME,TYPE,QUANTITY,AGENCY&f=geojson')
    //   .then(response => response.json())
    //   .then((data:any) => {
    //     console.log("The response")
    //     console.log(data)
    //     // extract waypoints from GeoJSON data
    //     const waypoints: Place[] = data.features.map((feature:any) => {
    //       // console.log(feature.properties)
    //       return{
    //         name:feature.properties.SITE_NAME, 
    //         lat:feature.geometry.coordinates[1], 
    //         lng:feature.geometry.coordinates[0],
    //       }
    //     });
    //     console.log(waypoints)
    //     setCampsites(waypoints);

    //     // // extract waypoints from GeoJSON data
    //     // const waypoints: Place[] = data.features.map((feature:any) => {
    //     //   console.log(feature.properties.latitude)
    //     //   return{
    //     //     name:feature.properties.title, 
    //     //     lat:feature.properties.latitude, 
    //     //     lng:feature.properties.longitude,
    //     //   }
    //     // });
    //     // setCampsites(waypoints);
    //   })
    //   .catch(error => console.error('An error occurred:', error));

    // setPlaces([...places, myPlace]);
  },[]);

  function handleDblClick (e: google.maps.MapMouseEvent): void {
    if (!e.latLng) return;
    setSearchTrailsLoc({lat:e.latLng.lat(), lng:e.latLng.lng()});
  }
  

  function handleOnClick (e: google.maps.MapMouseEvent): void {
    toast.dismiss()
    if (selectingPlace) {
      if (!e.latLng) return;
      const lat: number = e.latLng.lat()
      const lng: number = e.latLng.lng()
      const myPlace: Place = {name: lat + ", " + lng, lat:lat, lng:lng}
      setSearchResult(myPlace)
      setPlaces([...places, myPlace]);
      setSelectingPlace(false)
      toast.info("Added location to trip", {autoClose:1500})
    }
  }

  function handleTrailSelect() {
    let myPlace: Place;
    if (selectedTrail) {
      toast.info("Added trail to trip!", {autoClose:1500})
      setSelectedTrail(undefined)
      const lat: number = selectedTrail.coordinates.lat;
      const lng: number = selectedTrail.coordinates.lng;
      if (selectedTrail.name)
        myPlace = {name: selectedTrail.name, lat:lat, lng:lng}
      else
        myPlace = {name: lat+", "+lng, lat:lat, lng:lng}
      setPlaces([...places, myPlace]);
    }
  }

  function handleCampgroundSelect() {
    let myPlace: Place;
    if (selectedCampground) {
      toast.info("Added campground to trip!", {autoClose:1500})
      setSelectedCampground(undefined)
      const lat: number = selectedCampground.geometry.coordinates[1];
      const lng: number = selectedCampground.geometry.coordinates[0];
      if (selectedCampground.properties.SITE_NAME)
        myPlace = {name: selectedCampground.properties.SITE_NAME, lat:lat, lng:lng}
      else
        myPlace = {name: lat+", "+lng, lat:lat, lng:lng}
      setSearchResult(myPlace)
      setPlaces([...places, myPlace]);
    }
  }

  function handleCampgroundClick(index: number) {
    if (!campgrounds) return;
    setSelectedCampground(campgrounds[index])
  }

  function handleCampsiteSelect() {
    let myPlace: Place;
    if (selectedCampsite) {
      toast.info("Added campsite to trip!", {autoClose:1500})
      setSelectedCampsite(undefined);
      const lat: number = selectedCampsite.geometry.coordinates[1];
      const lng: number = selectedCampsite.geometry.coordinates[0];
      myPlace = {name: lat+", "+lng, lat:lat, lng:lng}
      setSearchResult(myPlace)
      setPlaces([...places, myPlace]);
    }
  }

  function handleCampsiteClick(index: number) {
    if (!dispersedCampsites) return;
    setSelectedCampsite(dispersedCampsites[index])
  }
  

  return (
    <div className="container">
      <div className="header">
        <Hamburger label="Show Trip Planner" color="white" size={25} toggled={sidebar} toggle={setSidebar} />
        <h1>TrailTrekker</h1>
      </div>
      
      <div id="map">
        <div className={sidebar ? 'nav-menu active' : 'nav-menu'}>
        <TripPlanner places={places} setShowDispersedCampsites={setShowDispersedCampsites} setShowCampgrounds={setShowCampgrounds} showDispersedCampsites={showDispersedCampsites} showCampgrounds={showCampgrounds} setSelectingPlace={setSelectingPlace} setPlaces={setPlaces} directions={directions} setDirections={setDirections} searchResult={searchResult} campgrounds={campgrounds} setCampgrounds={setCampgrounds} setSearchResult={(position) => {
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
            onClick={handleOnClick}
            onIdle={onIdle}
          >


            <ToastContainer 
              position="bottom-center"
              draggable
              autoClose={false} 
              theme="light"
              hideProgressBar={true}
            />


            {(searchResult && !directions) && (
              <>
                <Marker
                  position={searchResult}
                />
              </>
            )}



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



            {trailResults && (
              <Spots searchTrailsLoc={searchTrailsLoc} setTrailResults={setTrailResults} trailResults={trailResults}/>
            )}


            {(showDispersedCampsites && dispersedCampsites) && (
              <MarkerClusterer>
                {clusterer =>
                  dispersedCampsites.map((camp:DispersedCampsite, i:number) => (
                    <Marker
                      icon="/tent-icon.png"
                      key={i}
                      position={{ lat: camp.geometry.coordinates[1], lng: camp.geometry.coordinates[0] }}
                      clusterer={clusterer}
                      onClick={()=>handleCampsiteClick(i)}
                    />

                  ))
                }
              </MarkerClusterer>
            )}

            
            {(showCampgrounds && campgrounds) && (
              <MarkerClusterer>
                {clusterer =>
                  campgrounds.map((camp:Campground, i:number) => (
                    <Marker
                      icon="/tent-icon.png"
                      key={i}
                      position={{ lat: camp.geometry.coordinates[1], lng: camp.geometry.coordinates[0] }}
                      clusterer={clusterer}
                      onClick={()=>handleCampgroundClick(i)}
                    />

                  ))
                }
              </MarkerClusterer>
            )}


            {selectedCampground && (
              <InfoWindow
                position={{lat: selectedCampground.geometry.coordinates[1], lng: selectedCampground.geometry.coordinates[0]}}
                onCloseClick={() => {
                  setSelectedCampground(undefined);
                }}
              >
                <div>
                  <div className="infoheader">
                    <h2> {selectedCampground.properties.SITE_NAME}</h2>
                    <AddIcon onClick={handleCampgroundSelect} fontSize="large"/>
                  </div>
                  {selectedCampground.properties.TYPE && (<p>Type of Site: {selectedCampground.properties.TYPE}</p>)}
                  {selectedCampground.properties.AGENCY && (<p>Agency: {selectedCampground.properties.AGENCY}</p>)}
                  {(selectedCampground.geometry.coordinates[1] && selectedCampground.geometry.coordinates[0]) && (<p>Coordinates: ({selectedCampground.geometry.coordinates[1].toFixed(4)}, {selectedCampground.geometry.coordinates[0].toFixed(4)})</p>)}
                </div>
              </InfoWindow>
            )}


            {selectedCampsite && (
              <InfoWindow
                position={{lat: selectedCampsite.geometry.coordinates[1], lng: selectedCampsite.geometry.coordinates[0]}}
                onCloseClick={() => {
                  setSelectedCampsite(undefined);
                }}
              >
                <div>
                  <div className="infoheader">
                    <h2> {selectedCampsite.properties.title}</h2>
                    <AddIcon onClick={handleCampsiteSelect} fontSize="large"/>
                  </div>
                  <p>Type of Site: Dispersed Campsite</p>
                  {selectedCampsite.properties.elevation && (<p>Elevation: {selectedCampsite.properties.elevation}ft</p>)}
                  {(selectedCampsite.geometry.coordinates[1] && selectedCampsite.geometry.coordinates[0]) && (<p>Coordinates: ({selectedCampsite.geometry.coordinates[1].toFixed(4)}, {selectedCampsite.geometry.coordinates[0].toFixed(4)})</p>)}
                </div>
              </InfoWindow>
            )}


            {selectedTrail && (
              <InfoWindow
                position={selectedTrailLoc}
                onCloseClick={() => {
                  setSelectedTrail(undefined);
                }}
              >
                <div>
                  <div className="infoheader">
                    <h2> {selectedTrail.name}</h2>
                    <AddIcon onClick={handleTrailSelect} fontSize="large"/>
                  </div>
                  
                  {selectedTrail.length && (<p>Length: {selectedTrail.length}mi</p>)}
                  {selectedTrail.forest && (<p>Forest: {selectedTrail.forest}</p>)}
                  {selectedTrail.system && (<p>System: {selectedTrail.system}</p>)}
                  {selectedTrail.dateRange && (<p>Dates Open: {selectedTrail.dateRange}</p>)}
                  {selectedTrail.description && (<p>Description: {selectedTrail.description}</p>)}
                  {selectedTrail.level && (<p>Level: {selectedTrail.level}</p>)}
                  {selectedTrail.dateRange && (<p>Vehicles Allowed: {selectedTrail.allowedVehicles}</p>)}
                </div>
              </InfoWindow>
            )}

          </GoogleMap>
      </div>
    </div>
  );
}
