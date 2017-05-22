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
  var valid = determineIntersect(userShapes);
  // Remove previous results before displaying new results
  resetTables();
  // Add tables
  if (valid){
    addTable(need);
    addTable(enroll);
    addTable(care);
    // Jump to results section
    $('[href="#results"]').tab('show');

  }
};

// Jump To Button Event Handler
$(document.body).on('click', '.dropdown-menu li button', function (e) {
  var selected = $(this).text();
  for (var i = 0; i < commAreas.features.length; i++){
    var commArea = commAreas.features[i];
    if (commArea.properties.community.toLowerCase() === selected.toLowerCase()){
      var centroid = turf.centroid(commArea);
      var coordinates = centroid.geometry.coordinates
      var leafletCoordinates = [coordinates[1],coordinates[0]];
      map.setView(leafletCoordinates,13);
    }
  }
});

// Function to Determine which tracts intersect userShapes
function determineIntersect(userShapes)
{
  try{
    for (var i = 0; i < userShapes.length; i++){
      var userShape = userShapes[i];
      intersect(userShape,tracts)
    }
    return true
  }
  catch(err) {
    alert("Invalid shape. Please try again");
    return false
  }

};

function intersect(userShape, geographies){
  for (var j = 0; j < geographies.features.length; j++){
    var geography = geographies.features[j];
    var intersection = turf.intersect(userShape, geography['geometry']);
    if (intersection != null){
      geography.properties.intersection = true;
      var geographyArea = turf.area(geography);
      var intersectionArea = turf.area(intersection);
      geography.properties.overlap = intersectionArea / geographyArea;
    }
  }

}

// Function to aggregate statistics
function estimatesCalculations(stat, geographies)
{
  var row = {};
  var meas = stat.replace("n", "r");
  var meas_wgt = stat.replace("n", "w");
  var meas_se = meas + "_se";
  var meas_se_num = stat + "_se";

  // Iniitialize values
  row['name'] = stat;
  row['meas_aggregate_wgt'] = 0;
  row['meas_aggregate_mean'] = 0;
  row['meas_aggregate_var'] = 0;
  row['intersectCount'] = 0;

  // Iniitialize values for estimate numbers
  var meas_se_num = stat + "_se";
  row['meas_aggregate_wgt_num'] = 0;
  row[stat] = 0;
  row['meas_aggregate_var_num'] = 0;

  // Caclulate total weight for selection
  for (var i = 0; i < geographies.features.length; i++){
    var geography = geographies.features[i];
    if (geography.properties.intersection && geography.properties.hasOwnProperty(stat)){
      row['meas_aggregate_wgt'] = row['meas_aggregate_wgt'] + (Number(geography.properties[meas_wgt]) * geography.properties.overlap);
      row[stat] = (Number(geography.properties[stat]) * geography.properties.overlap) + row[stat];
      row['intersectCount'] = row['intersectCount'] + 1;
    }
  };

  //Calculate mean and variance for measure
  for (var i = 0; i < geographies.features.length; i++){
    var geography = geographies.features[i];
    if (geography.properties.intersection && geography.properties.hasOwnProperty(stat)){
      // Only add value if the wgt and count are more than zero
      if (geography.properties[meas_wgt] > 0 && geography.properties[meas] > 0){
        row['meas_aggregate_mean'] = row['meas_aggregate_mean'] + Number(((geography.properties.overlap * geography.properties[meas_wgt]) / row['meas_aggregate_wgt']) * geography.properties[meas]);
      }
      // Only add value if the meas_aggregate_wgt is above zero
      if (row['meas_aggregate_wgt'] > 0){
        row['meas_aggregate_var'] = row['meas_aggregate_var'] + Math.pow((geography.properties.overlap * geography.properties[meas_wgt]) / row['meas_aggregate_wgt'],2) * (Math.pow(geography.properties[meas_se],2));
        row['meas_aggregate_var_num'] = row['meas_aggregate_var_num'] + Math.pow((geography.properties.overlap * geography.properties[meas_wgt]) / row['meas_aggregate_wgt'],2) * (Math.pow(geography.properties[meas_se_num],2));

      }
    }
  };
  row['meas_aggregate_se'] = Math.sqrt(row['meas_aggregate_var']);
  row['meas_aggregate_se_num'] = Math.sqrt(row['meas_aggregate_var_num']);

  // 90% Confidence Intervals
  row['stat_lb'] = Math.round(row[stat] - (1.645 * row['meas_aggregate_se_num']));
  row['stat_ub'] = Math.round(row[stat] + (1.645 * row['meas_aggregate_se_num']));

  row['rate_lb'] = (row['meas_aggregate_mean'] - (1.645 * row['meas_aggregate_se']))
  row['rate_ub'] = (row['meas_aggregate_mean'] + (1.645 * row['meas_aggregate_se']))


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
  row['perc'] = Math.round((row['meas_aggregate_mean'] * 100),2).toString().concat("%");
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
    // process tract level variables
    if (table.vars[i].unit === 'tract'){
      console.log(table.vars[i].specialFormat);
      if (!table.vars[i].specialFormat){
        var row = estimatesCalculations(table.vars[i].name,tracts);
        addRow(table.name, row, table.vars[i].name,table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel);
      }
      if (table.vars[i].specialFormat){
        var row = simpleWeightCalculation(table.vars[i].name,tracts);
        displaySimpleWeight(table.name, row,table.vars[i].label, table.vars[i].source);
      }

    }

    // process commArea group level variables
    if (table.vars[i].unit === 'commArea'){
      var row = estimatesCalculations(table.vars[i].name,commAreas);
      addRow(table.name, row, table.vars[i].name,table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel);
    }

  }
};

function simpleWeightCalculation(stat, geographies){
  // Iniitialize values
  var row = {};
  row['name'] = stat;
  row[stat] = 0;
  row['intersectCount'] = 0;


  // Caclulate total weighted estimate
  for (var i = 0; i < geographies.features.length; i++){
    var geography = geographies.features[i];
    if (geography.properties.intersection && geography.properties.hasOwnProperty(stat)){
      row[stat] = (Number(geography.properties[stat]) * geography.properties.overlap) + row[stat];
      row['intersectCount'] = row['intersectCount'] + 1;
    }
  }
  row['simpleAvg'] = row[stat] / row['intersectCount'];
  return row;
}

function displaySimpleWeight(tableName, row, label, source){
  var table = document.getElementById(tableName);
  var NewRow = document.createElement("tr");
  table.appendChild(NewRow);

  addHover(NewRow,label,source, true);
  addMeas(NewRow,"");
  addMeas(NewRow,"");
  addMeas(NewRow, row['simpleAvg'].toLocaleString('en'));

}

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
  table.appendChild(NewRow);

  addHover(NewRow,label,source, true);
  addReliability(NewRow, row['reliability']);
  addMeas(NewRow, row['stat_lb'].toLocaleString('en').concat(" to ").concat(row['stat_ub'].toLocaleString('en')))
  if (row['rate_lb'] >= 0){
    addHover(NewRow,row['rate_lb'].toLocaleString('en', {style: "percent"}).concat(" to ").concat(row['rate_ub'].toLocaleString('en', {style: "percent"})),pctLabel, false)
  }
  if (row['rate_lb'] < 0 ){
    addHover(NewRow,'0%'.concat(" to ").concat(row['rate_ub'].toLocaleString('en', {style: "percent"})),pctLabel, false)
  }

};

function addMeas(row,val)
{
  var NewCol = document.createElement("td");
  var TextVal = document.createTextNode(val);
  row.appendChild(NewCol);
  NewCol.appendChild(TextVal);
};

function addHover(row,val,hover, labelBool)
{

  var NewCol = document.createElement("td");
  var toolTip = document.createElement("tooltiptext")
  toolTip.setAttribute("title", hover);
  var TextVal = document.createTextNode(val);
  $(TextVal).appendTo(toolTip);
  row.appendChild(NewCol);
  NewCol.appendChild(toolTip);
  // Apply label id to set wider margin
  if (labelBool){
    NewCol.setAttribute("id", "label")
  }
};

function addReliability(row,reliability)
{
  var NewCol = document.createElement("td");
  row.appendChild(NewCol);

  var green = document.createElement("img");
  green.setAttribute("src", "greenlight.png");
  green.setAttribute("height","25px");
  green.setAttribute("width", "25px");

  var yellow = document.createElement("img");
  yellow.setAttribute("src", "yellowlight.png");
  yellow.setAttribute("height","25px");
  yellow.setAttribute("width", "25px");

  var red = document.createElement("img");
  red.setAttribute("src", "redlight.png");
  red.setAttribute("height","25px");
  red.setAttribute("width", "25px");

  if (reliability === "green"){
    NewCol.appendChild(green);
  }
  if (reliability === "yellow"){
    NewCol.appendChild(yellow);
  }
  if (reliability === "red"){
    NewCol.appendChild(red);
  }
};

// Reset Tables
function resetTables()
{
  var table_names = ["enroll", "need", "care"];
  var question_names = ["enrollQuestion", "needQuestion", "careQuestion"];
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
