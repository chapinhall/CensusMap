// Statistics
var rHhs_Rent = {name: 'nHhs_Rent', label: 'Housholds below the poverty line, that rent their housing unit',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of households below the poverty line who rent their housing unit, as a percentage of all households below the poverty line'}

var nFamLtPov_Ge3OwnKids = {name: 'nFamLtPov_Ge3OwnKids', label: 'Families below the poverty line, who are living with three or more of their own children in the household',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of families below the poverty line with three or more of their own children, as a percentage of all families below the poverty line'}

var nHhSizeCars_Ge3PerHh_0Cars = {name: 'nHhSizeCars_Ge3PerHh_0Cars', label: 'Households with three or more members, with no vehicles at home.',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of households with three or more members and no vehicles at home, as a percentage of all households with three or more members'}

var nBirths_Teen = {name: 'nBirths_Teen', label: 'Births, to a teen mother',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of births to mothers aged 19 or less, as a percentage of all births'}

var nKidsLt6_GpCare = {name: 'nKidsLt6_GpCare', label: 'Children aged 6 or less, who are in the care of a grandparent householder',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of children aged 6 or less who are in the care of a grandparent households, as a percentage of all children aged 6 or less'}

var nRenters_Ge30Pct = {name: 'nRenters_Ge30Pct', label: 'Housholds that rent, who pay more than 30% of their income in rent',
source: 'American Community Survey (ACS)', pctLabel: 'This is the number of households that pay more than 30% of their income in rent, as a percentage of all households that rent'}

// Tables
var need = {name: 'need', vars: [rHhs_Rent, nBirths_Teen, nKidsLt6_GpCare, nRenters_Ge30Pct], qId: "needQuestion", qText: "What needs are in the community?"}
var enroll = {name: 'enroll', vars: [nFamLtPov_Ge3OwnKids, nHhSizeCars_Ge3PerHh_0Cars], qId: "enrollQuestion", qText: "How many families are likely to enroll in community-based programs / school based programs?"}
