
var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 12);
var userShapes = new Array();
var highlightTracts = { "type": "FeatureCollection","features": []};



L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);

function mainStyle(feature) {
    return {
        fillColor: '#2ca25f',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.4
    };
}

function highlightStyle(feature) {
    return {
        fillColor: '#2c7fb8',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.4
    };
}

// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
//   }

geojson = L.geoJson(tracts, {style: mainStyle}).addTo(map);

// L.geoJson(data, {
//     style: function (feature) {
//         return {color: feature.properties.color};
//     },
//     onEachFeature: function (feature, layer) {
//         layer.bindPopup(feature.properties.description);
//     }
// }).addTo(map);



// add draw interface for userArea
var drawnItems = new L.LayerGroup();
L.drawLocal.draw.toolbar.buttons.polygon = 'Draw the area you want examine';

     map.addLayer(drawnItems);
     var drawControl = new L.Control.Draw({
         position: 'topright',
         draw: {
          circle: false,
          rectangle: false,
          polyline: false,
          marker: false,
          polygon: {
            shapeOptions:{
              color: 'red'
            }
          },

         },
     });
     map.addControl(drawControl);

    map.on("draw:created", function (e) {
      var type = e.layerType,
         userArea = e.layer;
      drawnItems.addLayer(userArea);
      $('#calculate').removeAttr("disabled");

      $('#delete').removeAttr("disabled")
      userGeojson = userArea.toGeoJSON().geometry;
      userShapes.push(userGeojson);
});

document.getElementById("delete").onclick = function () {
  drawnItems.clearLayers();
  $('#calculate').attr("disabled","disabled");
  $('#delete').attr("disabled","disabled");
  var userShapes = [];
  map.removeLayer(highlightGeojson);
  map.removeLayer(geojson);
  geojson.resetStyle(highlightGeojson);
  geojson = L.geoJson(tracts, {style: mainStyle}).addTo(map);
  highlightTracts = { "type": "FeatureCollection","features": []};
 };

 document.getElementById("calculate").onclick = function () {
  determineIntersect(userShapes);
  highlightGeojson = L.geoJson(highlightTracts, {style: highlightStyle}).addTo(map);


 };

 function determineIntersect(userShapes)
{
  for (var i = 0; i < userShapes.length; i++){
    var userShape = userShapes[i];
    for (var j = 0; j < tracts.features.length; j++){
      var tract = tracts.features[j];
      var intersection = turf.intersect(userShape, tract['geometry']);
      if (intersection != null){
        highlightTracts.features.push(intersection);
      }
    }
  }
};



