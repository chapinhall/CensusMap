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
  for (var i = 0; i < commAreas.features.length; i++){
    commAreas.features[i].properties.intersection = false;
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
    addTable(eligible);
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
    for (var i = 0; i < userShapes.length; i++){
      var userShape = userShapes[i];
      intersect(userShape,commAreas)
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
function estimatesCalculations(stat, geographies, standardErrorFlag)
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
      if (row['meas_aggregate_wgt'] > 0 && standardErrorFlag){
        row['meas_aggregate_var'] = row['meas_aggregate_var'] + Math.pow((geography.properties.overlap * geography.properties[meas_wgt]) / row['meas_aggregate_wgt'],2) * (Math.pow(geography.properties[meas_se],2));
        row['meas_aggregate_var_num'] = row['meas_aggregate_var_num'] + Math.pow(geography.properties[meas_se_num],2);

      }
    }
  };
  if (standardErrorFlag){
    row['meas_aggregate_se'] = Math.sqrt(row['meas_aggregate_var']);
    row['meas_aggregate_se_num'] = Math.sqrt(row['meas_aggregate_var_num']);

    // 90% Confidence Intervals
    row['stat_lb'] = Math.round(row[stat] - (1.645 * row['meas_aggregate_se_num']));
    row['stat_ub'] = Math.round(row[stat] + (1.645 * row['meas_aggregate_se_num']));

    row['rate_lb'] = (row['meas_aggregate_mean'] - (1.645 * row['meas_aggregate_se']))
    row['rate_ub'] = (row['meas_aggregate_mean'] + (1.645 * row['meas_aggregate_se']))


    row['meas_aggregate_cv'] = row['meas_aggregate_se'] / row['meas_aggregate_mean'];
    row['reliability'] = calcReliability(row['meas_aggregate_cv']);
  }

  row[stat] = Math.round(row[stat]);
  row['perc'] = row['meas_aggregate_mean'].toLocaleString('en', {style: "percent"})
  return row;

};

function calcReliability(cv){
  if (cv > 0.4){
    var reliability = 'red';
  }
  if (cv <= 0.4 && cv > 0.12) {
    var reliability = 'yellow';
  }
  if (cv <= 0.12) {
    var reliability = 'green';
  }
  return reliability;

}

function simpleWeightCalculation(stat, geographies){
  // Iniitialize values
  var row = {};
  row['name'] = stat;
  row[stat] = 0;
  row['se_total'] = 0;
  var meas_se_num = stat + "_se";
  row['intersectCount'] = 0;


  // Caclulate total weighted estimate
  for (var i = 0; i < geographies.features.length; i++){
    var geography = geographies.features[i];
    if (geography.properties.intersection && geography.properties.hasOwnProperty(stat)){
      row[stat] = (Number(geography.properties[stat]) * geography.properties.overlap) + row[stat];
      row['se_total'] = (Number(geography.properties[meas_se_num]) * geography.properties.overlap) + row['se_total'];
      row['intersectCount'] = row['intersectCount'] + 1;
    }
  }

  row['simpleAvg'] = Math.round((row[stat] / row['intersectCount']));
  row['seAvg'] = row['se_total'] / row['intersectCount'];

  // 90% Confidence Intervals
  row['stat_lb'] = Math.round(row['simpleAvg'] - (1.645 * row['seAvg']));
  row['stat_ub'] = Math.round(row['simpleAvg'] + (1.645 * row['seAvg']));

  row['meas_aggregate_cv'] = row['seAvg'] / row['simpleAvg'];
  row['reliability'] = calcReliability(row['meas_aggregate_cv']);
  return row;
}

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
      var row = estimatesCalculations(table.vars[i].name,tracts, true);
      addRow(table.name, row, table.vars[i].name,table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel, table.vars[i].standardErrorFlag);
    }

    if (table.vars[i].unit === 'communityArea'){
      var row = estimatesCalculations(table.vars[i].name,commAreas,false);
      addRow(table.name, row, table.vars[i].name,table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel, table.vars[i].standardErrorFlag);
    }

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
function addRow(tableName, row, stat, label, source, pctLabel, standardErrorFlag)
{
  var table = document.getElementById(tableName);
  var NewRow = document.createElement("tr");
  table.appendChild(NewRow);
  addLabel(NewRow,label,source, true);

  //Special Formatting for Violent Crimes Measure
  if (stat === "nViolCrimesPer1k"){
    addReliability(NewRow, row['reliability']);
    addHover(NewRow,row['rate_lb'], row['rate_ub'], row['meas_aggregate_mean'],pctLabel,standardErrorFlag, true)
    blankMeas(NewRow);

  }

  if (stat !== "nViolCrimesPer1k"){

    if (standardErrorFlag){
      addReliability(NewRow, row['reliability']);
    }

    // For Measures that do not have standard errors
    if (!standardErrorFlag){
      addReliability(NewRow, 'grey');
    }

    addMeas(NewRow,row['stat_lb'],row['stat_ub'],row[stat], standardErrorFlag)
    addHover(NewRow,row['rate_lb'], row['rate_ub'], row['meas_aggregate_mean'],pctLabel, standardErrorFlag, false)
  }

};

function addMeas(row,lb,ub,stat,standardErrorFlag)
{
  // Do not let values fall below 0
  if (standardErrorFlag){
    if (lb < 0){
      lb = 0;
    }

    if (lb === ub){
      var TextVal = document.createTextNode(stat.toLocaleString('en'));
    }

    if (lb !== ub){
      var TextVal = document.createTextNode(lb.toLocaleString('en').concat(" to ".concat(ub.toLocaleString('en'))));
    }
  }
  if (!standardErrorFlag){
    var TextVal = document.createTextNode(stat.toLocaleString('en'));
  }

  var NewCol = document.createElement("td");
  row.appendChild(NewCol);
  NewCol.appendChild(TextVal);
};

function blankMeas(row)
{
  var NewCol = document.createElement("td");
  var TextVal = document.createTextNode("-");
  row.appendChild(NewCol);
  NewCol.appendChild(TextVal);
};

function addLabel(row,label,hover)
{

  var NewCol = document.createElement("td");
  var toolTip = document.createElement("tooltiptext")
  toolTip.setAttribute("title", hover);
  var TextVal = document.createTextNode(label);
  $(TextVal).appendTo(toolTip);
  row.appendChild(NewCol);
  NewCol.appendChild(toolTip);
  NewCol.setAttribute("id", "label")

};

function addHover(row,lb, ub, percent, hover, standardErrorFlag, specialFormatFlag)
{
  // limit percent range
  console.log(specialFormatFlag)
  if (standardErrorFlag){
    if (lb < 0){
      lb = 0;
    }
    if (ub > 100){
      ub = 100;
    }
    if (ub !== lb && !specialFormatFlag){
      var TextVal = document.createTextNode(lb.toLocaleString('en', {style: "percent"}).concat(" to ").concat(ub.toLocaleString('en', {style: "percent"})));
    }
    if (ub === lb && !specialFormatFlag){
      var TextVal = document.createTextNode(percent.toLocaleString('en', {style: "percent"}))
    }
  }
  if (!standardErrorFlag && !specialFormatFlag){
    var TextVal = document.createTextNode(percent.toLocaleString('en', {style: "percent"}))
  }
  if (specialFormatFlag){
    var TextVal = document.createTextNode(lb.toLocaleString('en').concat(" to ").concat(ub.toLocaleString('en')));
  }

  var NewCol = document.createElement("td");
  var toolTip = document.createElement("tooltiptext")
  toolTip.setAttribute("title", hover);
  $(TextVal).appendTo(toolTip);
  row.appendChild(NewCol);
  NewCol.appendChild(toolTip);
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

  var grey = document.createElement("img");
  grey.setAttribute("src", "greylight.png");
  grey.setAttribute("height","25px");
  grey.setAttribute("width", "25px");

  if (reliability === "green"){
    NewCol.appendChild(green);
  }
  if (reliability === "yellow"){
    NewCol.appendChild(yellow);
  }
  if (reliability === "red"){
    NewCol.appendChild(red);
  }
  if (reliability === 'grey'){
    NewCol.appendChild(grey);
  }
};

// Reset Tables
function resetTables()
{
  var table_names = ["eligible","enroll", "need", "care"];
  var question_names = ["eligibleQuestion","enrollQuestion", "needQuestion", "careQuestion"];
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
