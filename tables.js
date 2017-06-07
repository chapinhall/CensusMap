// Statistics
var nHhs_Rent = {name: 'nHhs_Rent', label: 'Households below the poverty line, that rent their housing unit',
source: 'American Community Survey (ACS) 2011-2015, B17019',unit: 'tract', pctLabel: 'This is the number of households below the poverty line who rent their housing unit,\nas a percentage of all households below the poverty line', standardErrorFlag: true}

var nFamLtPov_Ge3OwnKids = {name: 'nFamLtPov_Ge3OwnKids', label: 'Families below the poverty line, who are living with three or more of their own children in the household',
source: 'American Community Survey (ACS) 2011-2015, table B17023', unit: 'tract', pctLabel: 'This is the number of families below the poverty line with three or more of their own children,\nas a percentage of all families below the poverty line',standardErrorFlag: true }

var nHhSizeCars_Ge3PerHh_0Cars = {name: 'nHhSizeCars_Ge3PerHh_0Cars', label: 'Households with three or more members, with no vehicles at home.',
source: 'American Community Survey (ACS) 2011-2015, table B08201',unit: 'tract', pctLabel: 'This is the number of households with three or more members and no vehicles at home,\nas a percentage of all households with three or more members',standardErrorFlag: true }

var nBirths_Teen = {name: 'nBirths_Teen', label: 'Births, to a teen mother',
source: 'American Community Survey (ACS) 2011-2015, table B13002',unit: 'tract', pctLabel: 'This is the number of births to mothers aged 19 or less,\nas a percentage of all births',standardErrorFlag: true }

var nKidsLt6_GpCare = {name: 'nKidsLt6_GpCare', label: 'Children aged 6 or less, who are in the care of a grandparent householder',
source: 'American Community Survey (ACS) 2011-2015, table B10001', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less who are in the care of a grandparent households,\nas a percentage of all children aged 6 or less',standardErrorFlag: true }

var nRenters_Ge30Pct = {name: 'nRenters_Ge30Pct', label: 'Households that rent, who pay more than 30% of their income in rent',
source: 'American Community Survey (ACS) 2011-2015, B17019', unit: 'tract',pctLabel: 'This is the number of households that pay more than 30% of their income in rent,\nas a percentage of all households that rent',standardErrorFlag: true }

var nChLt6_1Par_Lf = {name: 'nChLt6_1Par_Lf', label: 'Single parent households with children under age 6, where the parent works',
source: 'American Community Survey (ACS) 2011-2015, table B23008', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less in single-parent households where the parent works,\nas a percentage of all children aged 6 or less in single-parent households',standardErrorFlag: true}

var nChLt6_2Par_Lf = {name: 'nChLt6_2Par_Lf', label: 'Two parent households with children under age 6, where both parents work',
source: 'American Community Survey (ACS) 2011-2015, table B23008', unit: 'tract', pctLabel: 'This is the number of children aged 6 or less in two-parent households where both parents work,\nas a percentage of all children aged 6 or less in two-parent households',standardErrorFlag: true}

var nAdultsGe25_LtHsEd = {name: 'nAdultsGe25_LtHsEd', label: 'Adults aged 25 or more, with less than a high school education',
source: 'American Community Survey (ACS) 2011-2015, table B15002', unit: 'tract', pctLabel: 'This is the number of adults aged 25 or more who have not earned at least a high school diploma (or equivalent),\nas a percentage of all adults aged 25 or more',standardErrorFlag: true }

var nViolCrimesPer1k = {name: 'nViolCrimesPer1k', label: "Violent Crimes per 1,000 residents", pctLabel: 'This is the ratio between the number of crimes,\n and the number of residents (in thousands)', unit: 'tract',
source: 'City of Chicago Data Portal reports on crime incidents classified as violent using the applicable FBI Uniform Crime Reporting codes, and population estimates from the ACS, Table B01003',standardErrorFlag: true }

var nParcc_below_either = {name: 'nParcc_below_either', label: "Chicago Public School students in 3rd grade,\n who are below proficiency in the PARCC test for either math or reading",
pctLabel: 'This is the number of 3rd grade students in the Chicago Public Schools who are below proficiency in the PARCC test for either math or reading,\nas a percentage of all CPS 3rd graders', unit: 'tract',
source: 'Chicago Public Schools Data', standardErrorFlag: false }

var nKids0005_IncLt100Fpl = {name: 'nKids0005_IncLt100Fpl', label: 'Children aged 5 or less,\n living below 100% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 5 or less living below 100% of the poverty line,\nas a percentage of all children aged 5 or less', standardErrorFlag: false}

var nKids0002_IncLt100Fpl = {name: 'nKids0002_IncLt100Fpl', label: 'Children aged birth to 3,\n living below 100% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged birth to 3 living below 100% of the poverty line,\nas a percentage of all children aged birth to 3',standardErrorFlag: false }

var nKids0305_IncLt100Fpl = {name: 'nKids0305_IncLt100Fpl', label: 'Children aged 3 to 5,\n living below 100% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 3 to 5 living below 100% of the poverty line,\nas a percentage of all children aged 3 to 5',standardErrorFlag: false}

var nKids0005_IncLt50Fpl = {name: 'nKids0005_IncLt50Fpl', label: 'Children aged 5 or less,\n living below 50% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 5 or less living below 50% of the poverty line,\nas a percentage of all children aged 5 or less',standardErrorFlag: false}

var nKids0002_IncLt50Fpl = {name: 'nKids0002_IncLt50Fpl', label: 'Children aged birth to 3,\n living below 50% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged birth to 3 living below 50% of the poverty line,\nas a percentage of all children aged birth to 3',standardErrorFlag: false}

var nKids0305_IncLt50Fpl = {name: 'nKids0305_IncLt50Fpl', label: 'Children aged 3 to 5,\n living below 50% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 3 to 5 living below 50% of the poverty line,\nas a percentage of all children aged 3 to 5',standardErrorFlag: false}

var nKids0005_IncLt185Fpl = {name: 'nKids0005_IncLt185Fpl', label: 'Children aged 5 or less,\n living below 185% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 5 or less living below 185% of the poverty line,\nas a percentage of all children aged 5 or less',standardErrorFlag: false}

var nKids0002_IncLt185Fpl = {name: 'nKids0002_IncLt185Fpl', label: 'Children aged birth to 3,\n living below 185% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged birth to 3 living below 185% of the poverty line,\nas a percentage of all children aged birth to 3',standardErrorFlag: false}

var nKids0305_IncLt185Fpl = {name: 'nKids0305_IncLt185Fpl', label: 'Children aged 3 to 5,\n living below 185% of the poverty line',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 3 to 5 living below 185% of the poverty line,\nas a percentage of all children aged 3 to 5',standardErrorFlag: false}

var nKids0005_CcapElig162 = {name: 'nKids0005_CcapElig162', label: 'Children aged 5 or less,\n eligible for Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 5 or less eligible for Child Care,\nas a percentage of all children aged 5 or less',standardErrorFlag: false}

var nKids0002_CcapElig162 = {name: 'nKids0002_CcapElig162', label: 'Children aged birth to 3,\n eligible for Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged birth to 3 eligible for Child Care,\nas a percentage of all children aged birth to 3',standardErrorFlag: false}

var nKids0305_CcapElig162 = {name: 'nKids0305_CcapElig162', label: 'Children aged 3 to 5,\n eligible for Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 3 to 5 eligible for Child Care,\nas a percentage of all children aged 3 to 5',standardErrorFlag: false}

var nKids0005_CcapHsElig162 = {name: 'nKids0005_CcapHsElig162', label: 'Children aged 5 or less,\n eligible for Head Start & Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 5 or less eligible for Head Start & Child Care,\nas a percentage of all children aged 5 or less',standardErrorFlag: false}

var nKids0002_CcapHsElig162 = {name: 'nKids0002_CcapHsElig162', label: 'Children aged birth to 3,\n eligible for Head Start & Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged birth to 3 eligible for Head Start & Child Care,\nas a percentage of all children aged birth to 3',standardErrorFlag: false}

var nKids0305_CcapHsElig162 = {name: 'nKids0305_CcapHsElig162', label: 'Children aged 3 to 5,\n eligible for Head Start & Child Care',
source: 'Chapin Hall Estimates', unit: 'communityArea',pctLabel: 'This is the number of children aged 3 to 5 eligible for Head Start & Child Care,\nas a percentage of all children aged 3 to 5',standardErrorFlag: false}

// Tables
var eligible = {name: 'eligible', vars: [nKids0005_IncLt100Fpl,nKids0002_IncLt100Fpl,nKids0305_IncLt100Fpl, nKids0005_IncLt50Fpl,nKids0002_IncLt50Fpl,nKids0305_IncLt50Fpl, nKids0005_IncLt185Fpl,nKids0002_IncLt185Fpl, nKids0305_IncLt185Fpl, nKids0005_CcapElig162, nKids0002_CcapElig162, nKids0305_CcapElig162,nKids0005_CcapHsElig162, nKids0002_CcapHsElig162, nKids0305_CcapHsElig162 ], qId: "eligibleQuestion", qText: "How many children are eligible for our program?"}
var need = {name: 'need', vars: [nViolCrimesPer1k,nParcc_below_either, nBirths_Teen, nHhs_Rent, nRenters_Ge30Pct, nKidsLt6_GpCare, nAdultsGe25_LtHsEd], qId: "needQuestion", qText: "What needs are in the community?"}
var enroll = {name: 'enroll', vars: [nFamLtPov_Ge3OwnKids, nHhSizeCars_Ge3PerHh_0Cars], qId: "enrollQuestion", qText: "How many families are likely to enroll in community-based programs / school based programs?"}
var care = {name: 'care', vars: [nChLt6_1Par_Lf, nChLt6_2Par_Lf], qId: "careQuestion", qText: "How many children need full time care?"}
