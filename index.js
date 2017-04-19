
var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 11);
var userShapes = new Array();
var calculations = {};



L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);

function style(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: '#e8b19c',
      dashArray: '3',
      fillOpacity: 0.3,
      fillColor: ('#e8b19c')
    };
  }

// Color Census Tracts
// geojson = L.geoJson(tracts, {style: style}).addTo(map);

//Color Neighborhoods
geojson = L.geoJson(neighborhoods, {style: style}).addTo(map);

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
              color: 'green'
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
  userShapes = [];
    for (var i = 0; i < tracts.features.length; i++){
    tracts.features[i].properties.intersection = false;
    tracts.features[i].properties.color = "#2c7fb8"
 };
  // var table = document.getElementById("results")
  var results = document.getElementById("displayTable");
  while (results.firstChild){
    results.removeChild(results.firstChild);
  }

 };

 document.getElementById("calculate").onclick = function () {
  determineIntersect(userShapes);
  calculations.population = calcPopulation(tracts);
  addToTable(calculations);

 };

 function determineIntersect(userShapes)
{
  for (var i = 0; i < userShapes.length; i++){
    var userShape = userShapes[i];
    for (var j = 0; j < tracts.features.length; j++){
      var tract = tracts.features[j];
      var intersection = turf.intersect(userShape, tract['geometry']);
      if (intersection != null){
        tract.properties.intersection = true;
        tract.properties.color = "#2ca25f"
        var tractArea = turf.area(tract);
        var intersectionArea = turf.area(intersection);
        tract.properties.overlap = intersectionArea / tractArea;
        console.log(tract.properties.overlap);

      }
    }
  }
};

 function calcPopulation(tracts)
{
  var pop = 0;
  for (var i = 0; i < tracts.features.length; i++){
      var tract = tracts.features[i];
    if (tract.properties.intersection){
        pop = (tract.properties.population * tract.properties.overlap) + pop;
      }
 };
 console.log(pop);
 return Math.round(pop);

};

function addToTable(calculations)
{

  var table = document.getElementById("displayTable")
  var NewRow = document.createElement("tr")
  var NewCol1 = document.createElement("td")
  var NewCol2 = document.createElement("td")
  var Text1 = document.createTextNode("Estimated Population")
  var Text2 = document.createTextNode(calculations.population.toString())

  table.appendChild(NewRow);
  NewRow.appendChild(NewCol1);
  NewRow.appendChild(NewCol2);
  NewCol1.appendChild(Text1);
  NewCol2.appendChild(Text2);
};

$(window).resize(function () {
  var h = $(window).height(),
  offsetTop = 60; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
  $('#content').css('height', (h - offsetTop));
}).resize();
