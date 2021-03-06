/* global L Tabletop */

/*
 * Script to display two tables from Google Sheets as point and polygon layers using Leaflet
 * The Sheets are then imported using Tabletop.js and overwrite the initially laded layers
 */

// init() is called as soon as the page loads
function init() {
  // PASTE YOUR URLs HERE

  // these URLs come from Google Sheets 'shareable link' form
  // the first is the polygon layer and the second the points
  //var polyURL ="https://docs.google.com/spreadsheets/d/e/2PACX-1vR56hl4sLcz3OAT3Vsb-dSEHMEm3QA8TSyJLu8CFnOVmPnpCdOHybH1opIn11WDvbVyw33ROi6Uzmnd/pubhtml";
    //"https://docs.google.com/spreadsheets/d/1EUFSaqi30b6oefK0YWWNDDOzwmCTTXlXkFHAc2QrUxM/edit?usp=sharing";
  var pointsURL ="https://docs.google.com/spreadsheets/d/1yIniMddiTvVcJFBO45tjeD6tSShpMJln9DfPcbKg0dU/edit?usp=sharing";

  var polyURL ="https://docs.google.com/spreadsheets/d/1cxH2l6Z0-wlgzLQgJs4-eMsDZQAq2XrLwQpf04e3Mx8/edit?usp=sharing";
  //var pointsURL ="https://docs.google.com/spreadsheets/d/1hEO51Lt59-IIrnAfDuB7eOJaKBYm5C_fdWIWEq4hLho/edit?usp=sharing";

  Tabletop.init({ key: polyURL, callback: addPolygons, simpleSheet: true });
  Tabletop.init({ key: pointsURL, callback: addPoints, simpleSheet: true }); // simpleSheet assumes there is only one table and automatically sends its data
}
window.addEventListener("DOMContentLoaded", init);

// Create a new Leaflet map centered on the continental US
var map = L.map("map").setView([40, -100], 4);

// This is the Carto Positron basemap
var basemap = L.tileLayer(
  "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
    subdomains: "abcd",
    maxZoom: 19
  }
);
basemap.addTo(map);

var sidebar = L.control
  .sidebar({
    container: "sidebar",
    closeButton: true,
    position: "right"
  })
  .addTo(map);

let panelID = "my-info-panel";
var panelContent = {
  id: panelID,
  tab: "<i class='fa fa-bars active'></i>",
  pane: "<p id='sidebar-content'></p>",
  title: "<h2 id='sidebar-title'>No state selected</h2>"
};
sidebar.addPanel(panelContent);

map.on("click", function() {
  sidebar.close(panelID);
});

// These are declared outisde the functions so that the functions can check if they already exist
var polygonLayer;
var pointGroupLayer;

// The form of data must be a JSON representation of a table as returned by Tabletop.js
// addPolygons first checks if the map layer has already been assigned, and if so, deletes it and makes a fresh one
// The assumption is that the locally stored JSONs will load before Tabletop.js can pull the external data from Google Sheets
function addPolygons(data) {
  if (polygonLayer != null) {
    // If the layer exists, remove it and continue to make a new one with data
    polygonLayer.remove();
  }



  // Need to convert the Tabletop.js JSON into a GeoJSON
  // Start with an empty GeoJSON of type FeatureCollection
  // All the rows will be inserted into a single GeoJSON
  var geojsonStates = {
    type: "FeatureCollection",
    features: []
  };

  for (var row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
    if (data[row].include == "y") {
      var coords = JSON.parse(data[row].geometry);

      geojsonStates.features.push({
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: coords
        },
        properties: {
          name: data[row].name,
          summary: data[row].summary,
          state: data[row].state,
          local: data[row].local
        }
      });
    }
  }

  // The polygons are styled slightly differently on mouse hovers
  var polygonStyle = { color: "#2ca25f", fillColor: "#99d8c9", weight: 1.5 };
  var polygonHoverStyle = { color: "green", fillColor: "#2ca25f", weight: 3 };

  polygonLayer = L.geoJSON(geojsonStates, {
    onEachFeature: function(feature, layer) {
      layer.on({
        mouseout: function(e) {
          e.target.setStyle(polygonStyle);
        },
        mouseover: function(e) {
          e.target.setStyle(polygonHoverStyle);
        },
        click: function(e) {
          // This zooms the map to the clicked polygon
          // map.fitBounds(e.target.getBounds());

          // if this isn't added, then map.click is also fired!
          L.DomEvent.stopPropagation(e);

          document.getElementById("sidebar-title").innerHTML =
            e.target.feature.properties.name;
          document.getElementById("sidebar-content").innerHTML =
            e.target.feature.properties.summary;
          sidebar.open(panelID);
        }
      });
    },
    style: polygonStyle
  }).addTo(map);
}

// addPoints is a bit simpler, as no GeoJSON is needed for the points
// It does the same check to overwrite the existing points layer once the Google Sheets data comes along
function addPoints(data) {
  if (pointGroupLayer != null) {
    pointGroupLayer.remove();
  }
  pointGroupLayer = L.layerGroup().addTo(map);

  //1o simeio to Peristeri
  var newelement1={};
  newelement1.lat = 38.039139;
  newelement1.lon = 23.679685;
  newelement1.location = 'Peristeri';
  newelement1.category = 'This is a very beautiful city.';
  data.push(newelement1);

  //2o simeio i Filadelfia
  var newelement2={};
  newelement2.lat = 38.037970;
  newelement2.lon = 23.740237;
  newelement2.location = 'Nea Filadelfia';
  newelement2.category = 'This is Nea Filadelfia.';
  data.push(newelement2);

  //To Polygon me ta simeia pou tou orisa
  var polygonPoints = [
        [38.041872, 23.668702],
        [38.044036, 23.698589],
        [38.033760, 23.696184],
        [38.032679, 23.674885]];

  //Kanw add to Polygon ston xarti
  var mypolygon = L.polygon(polygonPoints).addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  var markerType = "marker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  var markerRadius = 100;

  for (var row = 0; row < data.length; row++) {
    var marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].lat, data[row].lon], {radius: markerRadius});
    } else if (markerType == "circle") {
      marker = L.circle([data[row].lat, data[row].lon], {radius: markerRadius});
    } else {
      marker = L.marker([data[row].lat, data[row].lon]);
    }

    //Mono oti vrisketai ektos tou Polygon tha ginetai add ston xarti
    if (!mypolygon.getBounds().contains(marker._latlng))
    {
        marker.addTo(pointGroupLayer);
    }


    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].location + '</h2>There's a ' + data[row].level + ' ' + data[row].category + ' here');

    // COMMENT THE NEXT 14 LINES TO DISABLE SIDEBAR FOR THE MARKERS
    marker.feature = {
      properties: {
        location: data[row].location,
        category: data[row].category
      }
    };
    marker.on({
      click: function(e) {
        L.DomEvent.stopPropagation(e);
        document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.location;
        document.getElementById("sidebar-content").innerHTML =
          e.target.feature.properties.category;
        sidebar.open(panelID);
      }
    });

    // AwesomeMarkers is used to create fancier icons
    var icon = L.AwesomeMarkers.icon({
      icon: "info-sign",
      iconColor: "white",
      markerColor: getColor(data[row].category),
      prefix: "glyphicon",
      extraClasses: "fa-rotate-0"
    });
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
  }
}

// Returns different colors depending on the string passed
// Used for the points layer
function getColor(type) {
  switch (type) {
  case "Coffee Shop":
    return "green";
  case "Restaurant":
    return "blue";
  default:
    return "green";
  }
}
