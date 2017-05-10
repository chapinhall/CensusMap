// Statistics
var Num_Kids_A0to2 = {name: 'Num_Kids_A0to2', label: 'Children Age 0 to 2', souce: 'ACS 2011 -2015'}
var Num_Kids_A3to4 = {name: 'Num_Kids_A3to4', label: 'Children Age 3 to 4', souce: 'ACS 2011 -2015'}
var Num_Kids_AllParentsWorking = {name: 'Num_Kids_AllParentsWorking', label: 'Number of Children in Households where Both Parents Work', souce: 'ACS 2011 -2015'}
var Num_LtHsEd = {name: 'Num_LtHsEd', label: 'Less Than High School Education', souce: 'ACS 2011 -2015'}

// Tables
var eligible = {name: 'eligible', vars: [Num_Kids_A0to2, Num_Kids_A3to4], qId: "eligibleQuestion", qText: "How many children are eligible for our program?"}
var need = {name: 'need', vars: [Num_Kids_AllParentsWorking, Num_LtHsEd], qId: "needQuestion", qText: "What needs are in the community?"}

// Tables
var numChildren = {name: 'numChildren'], vars: [Num_Kids_A0to5, Num_Kids_A0to2, Num_Kids_A3to4, headers:["Relability Indicator", "Estimated Number", "Percent of All Children"]}
var fplALt6Children = {name: 'fplLt6Children', vars: [Num_IncRatKidsLt6_Lt50,Num_IncRatKidsLt6_Lt100,Num_IncRatKidsLt6_Lt185], headers: ["Relability Indicator", "Estimated Number", "Percent of All Children Age 0 to 5"]}
var fplALt3Children = {name: 'fplLt3Children', vars:[], headers: ["Relability Indicator", "Estimated Number", "Percent of All Children Age 0 to 3"]}
var fplA3to5Children = {name: 'fplA3to5Children', vars: [], headers: ["Relability Indicator", "Estimated Number", "Percent of All Children 3 to 5"]}
var parentsWorking = {name: 'parentsWorking', vars: [], headers: ["Relability Indicator", "Estimated Number", "Percent of All Households with Children Age 0-6"]}
var fplHH = {name: 'fplHH', vars: [], headers: ["Relability Indicator", "Estimated Number", "Percent of All Households Below 100% FPL"]}
var noCarHH = {name: 'noCarHH', vars: [], headers: ["Relability Indicator", "Estimated Number", "Percent of All Children"]}
var crime = {name: 'crime': vars: [], headers: ["Relability Indicator", "Rate per 1,000 Residents"]}
var ftCare = {name: 'ftCare', vars: [], headers: ["Relability Indicator", "Estimated Number", "Percent of All Households with Children Age 0-6"]}
