var map = L.map('map').setView([41.8781, -87.6298], 11);
var userShapes = new Array();

// See available CARTO basemaps here: https://carto.com/help/building-maps/basemap-list/
var tiles = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', 
  {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   maxZoom: 18,
	id: 'mapbox.streets'
  }).addTo(map);

// Check for Internet Explorer. Print Button Does not Work in IE
function isIE() {
  ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  return is_ie;
}
// Disable Print Button for Internet Explorer
if (isIE()){
	alert("Since you are using Internet Explorer, to print the map you will need to print it using your browser.\n\nYou can also switch to Chrome or Firefox to use the Print Map Button instead.")
} else{
	$('#print').removeAttr("disabled");
}

var printPlugin = L.easyPrint({
    title: 'Print',
	position: 'topleft',
	hideControlContainer: false,
	sizeModes: ['Current'],
	hidden: true,
	exportOnly:false
}).addTo(map);

// Print Button Event Handler.
document.getElementById("print").onclick = function() {
	printPlugin.printMap("CurrentSize","map")
};

// set styling of Areas
function style(feature) {
	return {
		weight: 2,
		opacity: 0.5,
		color: "#c16622",
		fillOpacity: 0.2,
		fillColor: "#c16622"
	};
}
//Color Neighborhoods
commAreas_layer = L.geoJson(commAreas, {
	style: style
}).addTo(map);

// Hide community areas depending  on zoom
map.on('zoomstart zoom zoomend', function(ev){
	toggleLayers();
})

function toggleLayers(){
    if (map.getZoom() >= 14 ){
		map.removeLayer(commAreas_layer);
    } else {
		commAreas_layer.addTo(map);
    }
}

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
			shapeOptions: {
				color: 'green'
			}
		},
	},
});
map.addControl(drawControl);


// Draw Event Handler.
map.on("draw:created", function(e) {
	var type = e.layerType,
		userArea = e.layer;
	drawnItems.addLayer(userArea);
	$('#calculate').removeAttr("disabled");
	$('#delete').removeAttr("disabled")
	userGeojson = userArea.toGeoJSON().geometry;
	userShapes.push(userGeojson);
});

// Delete Button Event Handler.
document.getElementById("delete").onclick = function() {
	drawnItems.clearLayers();
	$('#calculate').attr("disabled", "disabled");
	$('#delete').attr("disabled", "disabled");
	userShapes = [];
	for (var i = 0; i < tracts.features.length; i++) {
		tracts.features[i].properties.intersection = false;
	};
	for (var i = 0; i < commAreas.features.length; i++) {
		commAreas.features[i].properties.intersection = false;
	};
	resetTables();
};

// Calculate Button Event Handler
document.getElementById("calculate").onclick = function() {
	var valid = determineIntersect(userShapes);
	// Remove previous results before displaying new results
	resetTables();
	// Add tables
	if (valid) {
		addTable(eligible);
		addTable(need);
		addTable(enroll);
		addTable(care);
		// Jump to results section
		$('[href="#results"]').tab('show');

	}
};

// Jump To Button Event Handler
$(document.body).on('click', '.dropdown-menu li button', function(e) {
	var selected = $(this).text();
	for (var i = 0; i < commAreas.features.length; i++) {
		var commArea = commAreas.features[i];
		if (commArea.properties.community.toLowerCase() === selected.toLowerCase()) {
			var centroid = turf.centroid(commArea);
			var coordinates = centroid.geometry.coordinates
			var leafletCoordinates = [coordinates[1], coordinates[0]];
			map.setView(leafletCoordinates, 13);
		}
	}
});

// Function to Determine which tracts intersect userShapes
function determineIntersect(userShapes) {
	try {
		for (var i = 0; i < userShapes.length; i++) {
			var userShape = userShapes[i];
			intersect(userShape, tracts)
		}
		for (var i = 0; i < userShapes.length; i++) {
			var userShape = userShapes[i];
			intersect(userShape, commAreas)
		}
		return true
	} catch (err) {
		alert("Invalid shape. Please try again");
		return false
	}

};

function intersect(userShape, geographies) {
	for (var j = 0; j < geographies.features.length; j++) {
		var geography = geographies.features[j];
		var intersection = turf.intersect(userShape, geography['geometry']);
		if (intersection != null) {
			geography.properties.intersection = true;
			var geographyArea = turf.area(geography);
			var intersectionArea = turf.area(intersection);
			geography.properties.overlap = intersectionArea / geographyArea;
		}
	}

}

// Function to aggregate statistics
function estimatesCalculations(stat, geographies, standardErrorFlag) {
	var row = {};
	var subcalcs = {};
	var num = stat;
	var rat = stat.replace("n", "r");
	var wgt = stat.replace("n", "w");
	var num_se = num + "_se";
	var rat_se = rat + "_se";
	var wgt_se = wgt + "_se";

	// Iniitialize values
	row['name'] = stat;
	row['num_agg'] = 0;
	row['wgt_agg'] = 0;
	row['rat_agg'] = 0;
	row['intersectCount'] = 0;
	row['num_agg_var'] = 0;
	row['rat_agg_var'] = 0;
	row['wgt_agg_var'] = 0;

	// Calculate counts, weight, and variances for selection
	for (var i = 0; i < geographies.features.length; i++) {
		var geography = geographies.features[i];
		if (geography.properties.intersection && geography.properties.hasOwnProperty(num)) {
			row['num_agg'] = row['num_agg'] + (geography.properties.overlap * Number(geography.properties[num]));
			row['wgt_agg'] = row['wgt_agg'] + (geography.properties.overlap * Number(geography.properties[wgt]));
		}
	};

	for (var i = 0; i < geographies.features.length; i++) {
		var geography = geographies.features[i];
		if (geography.properties.intersection && geography.properties.hasOwnProperty(num)) {
			if (row['wgt_agg'] > 0 && standardErrorFlag) {
				row['num_agg_var'] = row['num_agg_var'] + Math.pow(geography.properties.overlap, 2) * Math.pow(geography.properties[num_se], 2);
				row['wgt_agg_var'] = row['wgt_agg_var'] + Math.pow(geography.properties.overlap, 2) * Math.pow(geography.properties[wgt_se], 2);
			}
			row['intersectCount'] = row['intersectCount'] + 1;
		}
	};

	// Calculate ratio and related variance
	row['rat_agg'] = row['num_agg'] / row['wgt_agg']
	if (standardErrorFlag) {
		row['rat_agg_var'] = deltaMethod(row['num_agg'], row['wgt_agg'], row['num_agg_var'], row['wgt_agg_var'], row['num_agg_var'])
	}

	// Create standard errors and confidence intervals from the above
	if (standardErrorFlag) {
		row['num_agg_se'] = Math.sqrt(row['num_agg_var']);
		row['rat_agg_se'] = Math.sqrt(row['rat_agg_var']);

		// 90% Confidence Intervals
		row['num_lb'] = Math.round(row['num_agg'] - (1.645 * row['num_agg_se']));
		row['num_ub'] = Math.round(row['num_agg'] + (1.645 * row['num_agg_se']));

		row['rat_lb'] = (row['rat_agg'] - (1.645 * row['rat_agg_se']))
		row['rat_ub'] = (row['rat_agg'] + (1.645 * row['rat_agg_se']))

		row['rat_agg_cv'] = row['rat_agg_se'] / row['rat_agg'];
		row['reliability'] = calcReliability(row['rat_agg_cv']);
	}

	row['num_agg'] = Math.round(row['num_agg']);

	row['perc'] = row['rat_agg'].toLocaleString('en', {
		style: "percent"
	})
	return row;

};

function calcReliability(cv) {
	if (cv > 0.4) {
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

function deltaMethod(mu1, mu2, var1, var2, covar12) {
	var d1 = 1 / mu2;
	var d2 = -mu1 / (Math.pow(mu2, 2));
	var vr = Math.pow(d1, 2) * var1 + Math.pow(d2, 2) * var2 + 2 * d1 * d2 * covar12;
	if (vr < 0) {
		vr = 0;
	}
	return vr
}

function calcReliability(cv) {
	if (cv > 0.4) {
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

function addTable(table) {
	// Add Header
	addHeader(table, "Measure");
	addHeader(table, "Reliability Indicator");
	addHeader(table, "Estimated Number");
	addHeader(table, "%");

	addQuestion(table.qText, table.name, table.qId);
	for (var i = 0; i < table.vars.length; i++) {
		// process tract level variables
		if (table.vars[i].unit === 'tract') {
			var row = estimatesCalculations(table.vars[i].name, tracts, true);
			addRow(table.name, row, table.vars[i].name, table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel, table.vars[i].standardErrorFlag);
		}

		if (table.vars[i].unit === 'communityArea') {
			var row = estimatesCalculations(table.vars[i].name, commAreas, false);
			addRow(table.name, row, table.vars[i].name, table.vars[i].label, table.vars[i].source, table.vars[i].pctLabel, table.vars[i].standardErrorFlag);
		}

	}
};

function addHeader(table, val) {
	var tableHead = document.getElementById(table.name)
	var HeadCol = document.createElement("th");
	var content = document.createTextNode(val);
	HeadCol.appendChild(content);
	tableHead.appendChild(HeadCol);
}

function addQuestion(content, tableName, questionId) {
	var section = document.getElementById('results')
	var table = document.getElementById(tableName)
	var question = document.createElement("h4");
	question.setAttribute("id", questionId);
	var qText = document.createTextNode(content);
	var insertedNode = section.insertBefore(question, table);
	question.appendChild(qText);
}

// Function to add row to results table
function addRow(tableName, row, stat, label, source, pctLabel, standardErrorFlag) {
	var table = document.getElementById(tableName);
	var NewRow = document.createElement("tr");
	table.appendChild(NewRow);
	addLabel(NewRow, label, source, true);

	//Special Formatting for Violent Crimes Measure
	if (stat === "nViolCrimesPer1k") {
		addReliability(NewRow, row['reliability']);
		addHover(NewRow, row['rat_lb'], row['rat_ub'], row['rat_agg'], pctLabel, standardErrorFlag, true)
		blankMeas(NewRow);

	}

	if (stat !== "nViolCrimesPer1k") {

		if (standardErrorFlag) {
			addReliability(NewRow, row['reliability']);
		}

		// For Measures that do not have standard errors
		if (!standardErrorFlag) {
			addReliability(NewRow, 'grey');
		}

		addMeas(NewRow, row['num_lb'], row['num_ub'], row['num_agg'], standardErrorFlag)
		addHover(NewRow, row['rat_lb'], row['rat_ub'], row['rat_agg'], pctLabel, standardErrorFlag, false)
	}

};

function addMeas(row, lb, ub, stat, standardErrorFlag) {
	// Do not let values fall below 0
	if (standardErrorFlag) {
		if (lb < 0) {
			lb = 0;
		}

		if (lb === ub) {
			var TextVal = document.createTextNode(stat.toLocaleString('en'));
		}

		if (lb !== ub) {
			var TextVal = document.createTextNode(lb.toLocaleString('en').concat(" to ".concat(ub.toLocaleString('en'))));
		}
	}
	if (!standardErrorFlag) {
		var TextVal = document.createTextNode(stat.toLocaleString('en'));
	}

	var NewCol = document.createElement("td");
	row.appendChild(NewCol);
	NewCol.appendChild(TextVal);
};

function blankMeas(row) {
	var NewCol = document.createElement("td");
	var TextVal = document.createTextNode("-");
	row.appendChild(NewCol);
	NewCol.appendChild(TextVal);
};

function addLabel(row, label, hover) {

	var NewCol = document.createElement("td");
	var toolTip = document.createElement("tooltiptext")
	toolTip.setAttribute("title", hover);
	var TextVal = document.createTextNode(label);
	$(TextVal).appendTo(toolTip);
	row.appendChild(NewCol);
	NewCol.appendChild(toolTip);
	NewCol.setAttribute("id", "label")

};

function addHover(row, lb, ub, percent, hover, standardErrorFlag, specialFormatFlag) {
	// limit percent range
	if (standardErrorFlag) {
		if (lb < 0) {
			lb = 0;
		}
		if (ub > 100) {
			ub = 100;
		}
		if (ub !== lb && !specialFormatFlag) {
			var TextVal = document.createTextNode(lb.toLocaleString('en', {
				style: "percent"
			}).concat(" to ").concat(ub.toLocaleString('en', {
				style: "percent"
			})));
		}
		if (ub === lb && !specialFormatFlag) {
			var TextVal = document.createTextNode(percent.toLocaleString('en', {
				style: "percent"
			}))
		}
	}
	if (!standardErrorFlag && !specialFormatFlag) {
		var TextVal = document.createTextNode(percent.toLocaleString('en', {
			style: "percent"
		}))
	}
	if (specialFormatFlag) {
		var TextVal = document.createTextNode(lb.toLocaleString('en').concat(" to ").concat(ub.toLocaleString('en')));
	}

	var NewCol = document.createElement("td");
	var toolTip = document.createElement("tooltiptext")
	toolTip.setAttribute("title", hover);
	$(TextVal).appendTo(toolTip);
	row.appendChild(NewCol);
	NewCol.appendChild(toolTip);
};

function addReliability(row, reliability) {
	var NewCol = document.createElement("td");
	row.appendChild(NewCol);

	var green = document.createElement("img");
	green.setAttribute("src", "greenlight.png");
	green.setAttribute("height", "25px");
	green.setAttribute("width", "25px");

	var yellow = document.createElement("img");
	yellow.setAttribute("src", "yellowlight.png");
	yellow.setAttribute("height", "25px");
	yellow.setAttribute("width", "25px");

	var red = document.createElement("img");
	red.setAttribute("src", "redlight.png");
	red.setAttribute("height", "25px");
	red.setAttribute("width", "25px");

	var grey = document.createElement("img");
	grey.setAttribute("src", "greylight.png");
	grey.setAttribute("height", "25px");
	grey.setAttribute("width", "25px");

	if (reliability === "green") {
		NewCol.appendChild(green);
	}
	if (reliability === "yellow") {
		NewCol.appendChild(yellow);
	}
	if (reliability === "red") {
		NewCol.appendChild(red);
	}
	if (reliability === 'grey') {
		NewCol.appendChild(grey);
	}
};

// Reset Tables
function resetTables() {
	var table_names = ["eligible", "enroll", "need", "care"];
	var question_names = ["eligibleQuestion", "enrollQuestion", "needQuestion", "careQuestion"];
	for (var i = 0; i < table_names.length; i++) {
		var results = document.getElementById(table_names[i]);
		var question = document.getElementById(question_names[i]);
		if ($(question).length) {
			question.remove();
		}
		while (results.firstChild) {
			results.removeChild(results.firstChild);
		}
	}
};
