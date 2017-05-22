// Statistics
var nHhs_Rent = {name: 'nHhs_Rent', label: 'Households below the poverty line, that rent their housing unit',
source: 'American Community Survey (ACS)',unit: 'tract', pctLabel: 'This is the number of households below the poverty line who rent their housing unit, as a percentage of all households below the poverty line'}

var nFamLtPov_Ge3OwnKids = {name: 'nFamLtPov_Ge3OwnKids', label: 'Families below the poverty line, who are living with three or more of their own children in the household',
source: 'American Community Survey (ACS)',unit: 'tract', pctLabel: 'This is the number of families below the poverty line with three or more of their own children, as a percentage of all families below the poverty line'}

var nHhSizeCars_Ge3PerHh_0Cars = {name: 'nHhSizeCars_Ge3PerHh_0Cars', label: 'Households with three or more members, with no vehicles at home.',
source: 'American Community Survey (ACS)',unit: 'tract', pctLabel: 'This is the number of households with three or more members and no vehicles at home, as a percentage of all households with three or more members'}

var nBirths_Teen = {name: 'nBirths_Teen', label: 'Births, to a teen mother',
source: 'American Community Survey (ACS)',unit: 'tract', pctLabel: 'This is the number of births to mothers aged 19 or less, as a percentage of all births'}

var nKidsLt6_GpCare = {name: 'nKidsLt6_GpCare', label: 'Children aged 6 or less, who are in the care of a grandparent householder',
source: 'American Community Survey (ACS)', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less who are in the care of a grandparent households, as a percentage of all children aged 6 or less'}

var nRenters_Ge30Pct = {name: 'nRenters_Ge30Pct', label: 'Households that rent, who pay more than 30% of their income in rent',
source: 'American Community Survey (ACS)', unit: 'tract',pctLabel: 'This is the number of households that pay more than 30% of their income in rent, as a percentage of all households that rent'}

var nChLt6_1Par_Lf = {name: 'nChLt6_1Par_Lf', label: 'Single parent households with children under age 6, where the parent works',
source: 'American Community Survey (ACS)', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less in single-parent households where the parent works, as a percentage of all children aged 6 or less in single-parent households'}

var nChLt6_2Par_Lf = {name: 'nChLt6_2Par_Lf', label: 'Two parent households with children under age 6, where both parents work',
source: 'American Community Survey (ACS)', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less in two-parent households where both parents work, as a percentage of all children aged 6 or less in two-parent households'}

var nAdultsGe25_LtHsEd = {name: 'nAdultsGe25_LtHsEd', label: 'Adults aged 25 or more, with less than a high school education',
source: 'American Community Survey (ACS)', unit: 'tract', pctLabel: 'This is the number of adults aged 25 or more who have not earned at least a high school diploma (or equivalent), as a percentage of all adults aged 25 or more'}

var violCrimes_per1k = {name: 'violCrimes_per1k', label: 'This is the ratio between the number of crimes, and the number of residents (in thousands)', unit: 'tract',
source: '	City of Chicago Data Portal', specialFormat: true}

// Tables
var need = {name: 'need', vars: [violCrimes_per1k, nBirths_Teen, nHhs_Rent, nRenters_Ge30Pct, nKidsLt6_GpCare, nAdultsGe25_LtHsEd], qId: "needQuestion", qText: "What needs are in the community?"}
var enroll = {name: 'enroll', vars: [nFamLtPov_Ge3OwnKids, nHhSizeCars_Ge3PerHh_0Cars], qId: "enrollQuestion", qText: "How many families are likely to enroll in community-based programs / school based programs?"}
var care = {name: 'care', vars: [nChLt6_1Par_Lf, nChLt6_2Par_Lf], qId: "careQuestion", qText: "How many children need full time care?"}
