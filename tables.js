// Statistics
var Num_Kids_A0to2 = {name: 'Num_Kids_A0to2', label: 'Children Age 0 to 2', source: 'ACS 2011 -2015'}
var Num_Kids_A3to4 = {name: 'Num_Kids_A3to4', label: 'Children Age 3 to 4', source: 'ACS 2011 -2015'}
var Num_Kids_AllParentsWorking = {name: 'Num_Kids_AllParentsWorking', label: 'Number of Children in Households where Both Parents Work', source: 'ACS 2011 -2015'}
var Num_LtHsEd = {name: 'Num_LtHsEd', label: 'Less Than High School Education', source: 'ACS 2011 -2015'}

// Tables
var eligible = {name: 'eligible', vars: [Num_Kids_A0to2, Num_Kids_A3to4], qId: "eligibleQuestion", qText: "How many children are eligible for our program?"}
var need = {name: 'need', vars: [Num_Kids_AllParentsWorking, Num_LtHsEd], qId: "needQuestion", qText: "What needs are in the community?"}
