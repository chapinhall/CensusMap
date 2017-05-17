var map = L.map('map').setView([41.8781, -87.6298], 11);
var userShapes = new Array();

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 18, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

// set styling of Areas
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

//Color Neighborhoods
geojson = L.geoJson(commAreas, {style: style}).addTo(map);

// Add draw interface for userArea
var drawnItems = new L.LayerGroup();
L.drawLocal.draw.toolbar.buttons.polygon = 'Draw the area you want examine';
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  position: 'bottomright',
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

// Draw Event Handler.
map.on("draw:created", function (e) {
  var type = e.layerType,
  userArea = e.layer;
  drawnItems.addLayer(userArea);
  $('#calculate').removeAttr("disabled");
  $('#delete').removeAttr("disabled")
  userGeojson = userArea.toGeoJSON().geometry;
  userShapes.push(userGeojson);
});

// Delete Button Event Handler.
document.getElementById("delete").onclick = function () {
  drawnItems.clearLayers();
  $('#calculate').attr("disabled","disabled");
  $('#delete').attr("disabled","disabled");
  userShapes = [];
  for (var i = 0; i < tracts.features.length; i++){
    tracts.features[i].properties.intersection = false;
  };
  resetTables();
};

// Calculate Button Event Handler
document.getElementById("calculate").onclick = function () {
  determineIntersect(userShapes);
  // Remove previous results before displaying new results
  resetTables();
  // Add tables
  addTable(need);
  addTable(enroll);

  // Jump to results section
  $('[href="#results"]').tab('show');
};

// Jump To Button Event Handler
$(document.body).on('click', '.dropdown-menu li button', function (e) {
  var selected = $(this).text();
  for (var i = 0; i < commAreas.features.length; i++){
    var commArea = commAreas.features[i];
    if (commArea.properties.community.toLowerCase() === selected.toLowerCase()){
      var centroid = turf.centroid(commArea);
      console.log(centroid.geometry.coordinates)
      var coordinates = centroid.geometry.coordinates
      var leafletCoordinates = [coordinates[1],coordinates[0]];
      map.setView(leafletCoordinates,13);
    }
  }
});

// Function to Determine which tracts intersect userShapes
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

// Function to aggregate statistics
function numCalculations(stat, tracts)
{
  var row = {};
  var meas = stat.replace("n", "r");
  var meas_wgt = stat.replace("n", "w");
  var meas_se = stat + "_se"

  // Iniitialize values
  row['name'] = stat;
  row['meas_aggregate_wgt'] = 0;
  row['meas_aggregate_mean'] = 0;
  row['meas_aggregate_var'] = 0;
  row[stat] = 0;
  row['intersectCount'] = 0;

  // Caclulate total weight for selection
  for (var i = 0; i < tracts.features.length; i++){
    var tract = tracts.features[i];
    if (tract.properties.intersection && tract.properties.hasOwnProperty(stat)){
      row['meas_aggregate_wgt'] = row['meas_aggregate_wgt'] + (Number(tract.properties[meas_wgt]) * tract.properties.overlap);
      row[stat] = (Number(tract.properties[stat]) * tract.properties.overlap) + row[stat];
      row['intersectCount'] = row['intersectCount'] + 1;
    }
  };

  //Calculate mean and variance for measure
  for (var i = 0; i < tracts.features.length; i++){
    var tract = tracts.features[i];
    if (tract.properties.intersection && tract.properties.hasOwnProperty(stat)){
      // Only add value if the wgt and count are more than zero
      if (tract.properties[meas_wgt] > 0 && tract.properties[meas] > 0){
        row['meas_aggregate_mean'] = row['meas_aggregate_mean'] + Number(((tract.properties.overlap * tract.properties[meas_wgt]) / tract.properties[meas_wgt]) * tract.properties[meas]);
      }
      // Only add value if the meas_aggregate_wgt is above zero
      if (row['meas_aggregate_wgt'] > 0){
        row['meas_aggregate_var'] = row['meas_aggregate_var'] + Math.pow((tract.properties.overlap * tract.properties[meas_wgt]) / row['meas_aggregate_wgt'],2) * (Math.pow(tract.properties[meas_se],2));
      }


    }
  };
  row['meas_aggregate_se'] = Math.sqrt(row['meas_aggregate_var']);
  row['meas_aggregate_cv'] = row['meas_aggregate_se'] / row['meas_aggregate_mean'];
  if (row['meas_aggregate_cv'] > 0.4){
    row['reliability'] = 'red';
  }
  if (row['meas_aggregate_cv'] <= 0.4 && row['meas_aggregate_cv'] > 0.12) {
    row['reliability'] = 'yellow';
  }
  if (row['meas_aggregate_cv'] <= 0.12) {
    row['reliability'] = 'green';
  }



  row[stat] = Math.round(row[stat]);

  row['perc'] = Math.round((row['meas_aggregate_mean'] * 100) / row['intersectCount'],2).toString().concat("%");



  return row;

};

function addTable(table){
  // Add Header
  addHeader(table,"Measure");
  addHeader(table,"Reliability Indicator");
  addHeader(table,"Estimated Number");
  addHeader(table,"%");

  addQuestion(table.qText, table.name, table.qId);
  for (var i = 0; i < table.vars.length; i++){
    var row = numCalculations(table.vars[i].name,tracts);
    console.log(table.vars[i].name);
    console.log(row);
    addRow(table.name, row, table.vars[i].name,table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel);
  }

};

function addHeader(table, val){
  var tableHead = document.getElementById(table.name)
  var HeadCol = document.createElement("th");
  var content = document.createTextNode(val);
  HeadCol.appendChild(content);
  tableHead.appendChild(HeadCol);
}



function addQuestion(content, tableName, questionId){
  var section = document.getElementById('results')
  var table = document.getElementById(tableName)
  var question = document.createElement("h4");
  question.setAttribute("id", questionId);
  var qText = document.createTextNode(content);
  var insertedNode = section.insertBefore(question,table);
  question.appendChild(qText);
}

// Function to add row to results table
function addRow(tableName, row, stat, label, source, pctLabel)
{
  var table = document.getElementById(tableName);
  var NewRow = document.createElement("tr");


  var statName = document.createElement("tooltiptext")
  statName.setAttribute("title", source);
  $('<p>' + label + '</p>').appendTo(statName);

  var NewCol1 = document.createElement("td");
  NewCol1.setAttribute("id", "label")
  var NewCol2 = document.createElement("td");
  var NewCol3 = document.createElement("td");

  var Text2 = document.createTextNode(row[stat].toLocaleString('en'));

  var percentName = document.createElement("tooltiptext")
  percentName.setAttribute("title", pctLabel);
  var percentText = document.createTextNode(row['perc'].toLocaleString('en', {style: "percent"}));
  $(percentText).appendTo(percentName);


  var NewCol4 = document.createElement("td");
  var Text4 = document.createTextNode(row['reliability']);




  // $('<p>' + (row['meas_aggregate_mean'].toLocaleString('en', {style: "percent"} + '</p>')).appendTo(percentName);
  // var Text3 = document.createTextNode(row['meas_aggregate_mean'].toLocaleString('en', {style: "percent"}));

  table.appendChild(NewRow);
  NewCol1.appendChild(statName);
  NewCol4.appendChild(Text4);
  NewRow.appendChild(NewCol1);
  NewRow.appendChild(NewCol4);
  NewRow.appendChild(NewCol2);
  NewRow.appendChild(NewCol3);
  NewCol2.appendChild(Text2);
  NewCol3.appendChild(percentName);
};

// Reset Tables
function resetTables()
{
  var table_names = ["enroll", "need"];
  var question_names = ["enrollQuestion", "needQuestion"];
  for (var i = 0; i < table_names.length; i++){
    var results = document.getElementById(table_names[i]);
    var question = document.getElementById(question_names[i]);
    if ($(question).length){
      question.remove();
    }
    while (results.firstChild){
      results.removeChild(results.firstChild);
    }
  }
};
