import requests
import json
import datetime
import ast

## call census api to get population data for tract in illinois. 
## List of lists with elements: population, state, zip
census = "http://api.census.gov/data/2010/sf1?get=P0010001&for=tract:*&in=state:17"
r = requests.get(census)
census = r.text
census = ast.literal_eval(census)
fieldnames = census.pop(0)

# call the plenario api to get the geojson format of the census tracts in chicago
tracts  = "http://plenar.io/v1/api/shapes/boundaries_census_tracts_2010/?data_type=json"
r = requests.get(tracts)
json_text = r.text
json_tracts = json.loads(json_text)

## add census attributes to census json
for t1 in json_tracts['features']:
    for t2 in census:
        population = int(t2[0])
        tract = t2[3]
        county = t2[2]
        #cook county code is 031
        if county == "031":
            if t1['properties']['tractce10'] == tract:
                t1['properties']['population'] = int(t2[0])
                t1['properties']['color'] = "#2c7fb8"


## save merged datasets to an output geojson file
json_string = json.dumps(json_tracts)
with open('census.json', 'w') as f:
    f.write(json_string)
f.close()
