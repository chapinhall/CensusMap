# Chicago Needs Assessment Tool

This tool has been developed by researchers at Chapin Hall at the University of Chicago according to the needs and
design guidance of staff at the Chicago Department of Family and Support Services (DFSS). This web tool is hosted
on GitHub pages, but accessible (specifically: redirected) at the DFSS [CNAT web page](http://cnat.childrenserviceschicago.com/).

## Updating the Data

Chapin Hall has a codebase--stored in the [`chi-hood-stats`](http://chudev01.chapinhall.org/nmader/chi-hood-stats) repo--which 
makes fresh pulls of American Community Survey data, Chicago crime incident data, and otherwise pulls from other estimates of
program eligibility and CPS proficiency rates. The first step in updating data used by the CNAT is to update tract- and Chicago Community
Area-level data by going to that repo and, in sequence running the scripts: `pull-acs.R`, `constr-acs.R`, `pull-crime.R`, and `merge-data.R`.

Next, take the resulting files `tract-level-indicators-for-cnat.csv` and `chapin-hall-estimates-of-program-eligible-youth-by-community-area.csv`
and copy them to the "data process" folder of this `CensusMap` repo.

Next, geospatial and other reference documents need to be updated with this information. The two steps to accomplish this involve:

1. Running the `census.py` script in the "data process" folder, which now automatically joins the appropriate new files to the .geojson objects
2. Opening each .geojson object, pre-pending "var tracts = " and "var commAreas = " corresponding to each filename, and save it as a .js file of the same name in the "layers" subfolder.

Finally, update the `tables.js` file in the main folder to have meta data corresponding to updates of the underlying data.

