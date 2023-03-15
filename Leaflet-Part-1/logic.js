// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//marker size based on magnitude
function markSize(mag) {
  return mag;
};

//opacity based on depth
function getColor(depth){
  return depth >= 90 ? "#ff0000":
         depth >= 70 ? "#ff6600":
         depth >= 50 ? "#ff9900":
         depth >= 30 ? "#ffff66":
         depth >= 10 ? "#99ff66":
                      "#009933";
}

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
  layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
}


function pointToLayer(feature, latlng) {
  // Determine the style of markers based on properties
  var markers = {
    radius: markSize(feature.properties.mag),
    fillColor: getColor(feature.geometry.coordinates[2]),
    fillOpacity: 1,
    color: "black",
    weight: 0.5
  }
  return L.circleMarker(latlng,markers);
}
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {



  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //Build legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var depthThresholds = [-10, 10, 30, 50, 70, 90];
    labels = [];
    for (var i = 0; i < depthThresholds.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depthThresholds[i]) + '"></i> ' +
        depthThresholds[i] + (depthThresholds[i + 1] ? '&ndash;' + depthThresholds[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}