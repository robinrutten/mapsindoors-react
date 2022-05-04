import React, {useState, useRef, useEffect} from "react";

import Search from "./Search";
import LocationDetails from "./LocationDetails";

function Map() {
  // I cannot get react-router to work from within the event listeners, so I create my own home-rolled poor man's "router"
  const pages = Object.freeze({
    NONE: "NONE",
    SEARCH: "SEARCH",
    LOCATION_DETAILS: "LOCATION_DETAILS"
  });
  let [page, setPage] = useState(pages.NONE);

  let [location, setLocation] = useState({});

  const mapElementReference = useRef(null); // We need a reference to the mi-map in order to add event listeners.

  useEffect(() => {
    // The function passed to useEffect will run after the render is committed to the screen.
    mapElementReference.current.addEventListener("mapsIndoorsReady", () => {
      mapElementReference.current
        .getMapInstance()
        .then(mapInstance =>
          mapInstance.setCenter({lat: 38.8974905, lng: -77.0362723})
        );

      mapElementReference.current
        .getMapsIndoorsInstance()
        .then(mapsIndoorsInstance => {
          mapsIndoorsInstance.addListener("click", location =>
            setLocationAndPage(location)
          );
        });
    });
  });

  function close() {
    console.log("Close");
    setPage(pages.NONE);
  }

  function setLocationAndPage(location, panTo = false) {
    setLocation(location);
    setPage(pages.LOCATION_DETAILS);

    if (panTo === true) {
      mapElementReference.current.panTo({
        lat: location.geometry.coordinates[1],
        lng: location.geometry.coordinates[0]
      });
    }
  }

  function filterAndFitView(onlyFitView) {
    window.mapsindoors.services.LocationsService.getLocations({
      floor: "0"
    }).then(locations => {
      const locationIds = locations.map(l => l.id);

      mapElementReference.current
        .getMapsIndoorsInstance()
        .then(mapsIndoorsInstance => {
          mapsIndoorsInstance.filter(locationIds.slice(0, 2), true);

          if (!onlyFitView) {
            // When using the code below, the output of this function isn't consitent
            // It seems to effect the fit to view in line 64
            // Click the "filter and fit view" multiple times
            window.requestAnimationFrame(() => {
              mapsIndoorsInstance.filter(locationIds.slice(0, 10), false);
            });
          }
        });
    });
  }

  return (
    <div className="map">
      <button
        onClick={() => {
          filterAndFitView();
        }}
      >
        filter and fit view (click many times!)
      </button>

      <button
        onClick={() => {
          filterAndFitView(true);
        }}
      >
        fit view only (works)
      </button>

      <button
        onClick={() => {
          mapElementReference.current
            .getMapInstance()
            .then(mapInstance =>
              mapInstance.setCenter({lat: 38.8960905, lng: -77.0362723})
            );
          filterAndFitView(); // nothing happens because the locations are not in the viewport
        }}
      >
        Update center and fit view
      </button>

      <mi-map-mapbox
        ref={mapElementReference}
        style={{width: "100%", height: "100%"}}
        access-token="pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg"
        mi-api-key="demo"
        floor-selector-control-position="top-right"
        my-position-control-position="top-right"
      ></mi-map-mapbox>

      {page !== pages.NONE && (
        <mi-card>
          <button className="card-close" onClick={() => close()}>
            &mdash;
          </button>

          {page === pages.SEARCH && (
            <Search resultClicked={setLocationAndPage}></Search>
          )}

          {page === pages.LOCATION_DETAILS && (
            <LocationDetails location={location}></LocationDetails>
          )}
        </mi-card>
      )}

      {page === pages.NONE && (
        <mi-card class="no-page">
          <button className="card-close" onClick={() => setPage(pages.SEARCH)}>
            ▲
          </button>
        </mi-card>
      )}
    </div>
  );
}

export default Map;
