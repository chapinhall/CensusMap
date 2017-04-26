
var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 11);
var userShapes = new Array();
var calculations = {};


// <div id='map' style='width: 400px; height: 300px;'></div>
// <script>
// mapboxgl.accessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v9'
// });
// </script>


// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
//     id: 'mapbox.light',
// }).addTo(map);
// L.mapbox.map('map-two', 'mapbox.streets').setView([40.783, -73.966], 13);
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
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
geojson = L.geoJson(tracts, {style: style}).addTo(map);

//Color Neighborhoods
// geojson = L.geoJson(neighborhoods, {style: style}).addTo(map);

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
 };
  // var table = document.getElementById("results")
  var results = document.getElementById("displayTable");
  while (results.firstChild){
    results.removeChild(results.firstChild);
  }

 };

 document.getElementById("calculate").onclick = function () {
  determineIntersect(userShapes);
  var numResult = numCalculations(tracts);
  for (calc in numResult){
    addToTable(calc, numResult[calc])
  }

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
        var tractArea = turf.area(tract);
        var intersectionArea = turf.area(intersection);
        tract.properties.overlap = intersectionArea / tractArea;

      }
    }
  }
};

 function numCalculations(tracts)
{
  var Num_Kids_A0to2 = 0;
  var Num_Kids_A3to4 = 0;
  var Num_NoCars = 0;
  var Num_Kids_AllParentsWorking = 0;
  var Num_SinglePar_OwnKidLt6 = 0;
  var Num_LtHsEd = 0;

  for (var i = 0; i < tracts.features.length; i++){
      var tract = tracts.features[i];
    if (tract.properties.intersection && tract.properties.Num_Kids_A3to4 !== undefined && tract.properties.Num_Kids_A0to2 !== undefined
    && tract.properties.Num_NoCars !== undefined && tract.properties.Num_Kids_AllParentsWorking !== undefined
  && tract.properties.Num_SinglePar_OwnKidLt6 !== undefined && tract.properties.Num_LtHsEd !== undefined ){
        Num_Kids_A0to2 = (Number(tract.properties.Num_Kids_A0to2) * tract.properties.overlap) + Num_Kids_A0to2;
        Num_Kids_A3to4 = (Number(tract.properties.Num_Kids_A3to4) * tract.properties.overlap) + Num_Kids_A3to4;
        Num_NoCars = (Number(tract.properties.Num_NoCars) * tract.properties.overlap) + Num_NoCars;
        Num_Kids_AllParentsWorking = (Number(tract.properties.Num_Kids_AllParentsWorking) * tract.properties.overlap) + Num_Kids_AllParentsWorking;
        Num_SinglePar_OwnKidLt6 = (Number(tract.properties.Num_SinglePar_OwnKidLt6) * tract.properties.overlap) + Num_SinglePar_OwnKidLt6;
        Num_LtHsEd = (Number(tract.properties.Num_LtHsEd) * tract.properties.overlap) + Num_LtHsEd;



      }
 };
 var numResult = {"Number of Children Age 0 to 2": Math.round(Num_Kids_A0to2),
 "Number of Children Age 3 to 4": Math.round(Num_Kids_A3to4),
 "Number of Household Without Cars": Math.round(Num_NoCars),
 "Number of Children With All Parents Working": Math.round(Num_Kids_AllParentsWorking),
 "Number of Single Parents with Kids Less Than 6": Math.round(Num_SinglePar_OwnKidLt6),
 "Number of Adults Less Than High School Education": Math.round(Num_LtHsEd)


}
 return numResult;

};

function addToTable(label, value)
{

  var table = document.getElementById("displayTable")
  var NewRow = document.createElement("tr")
  var NewCol1 = document.createElement("td")
  var NewCol2 = document.createElement("td")
  var Text1 = document.createTextNode(label)
  var Text2 = document.createTextNode(value.toString())

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
