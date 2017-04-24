import requests
import json
import datetime
import pandas as pd
import numpy as np

df = pd.read_csv("needs.csv")
df = df[pd.notnull(df['TRACT'])]
df['TRACT'] = df['TRACT'].astype(int)
NumVars = list(df.filter(regex=("Num.*")).columns)
WgtVars = list(df.filter(regex=("Wgt.*")).columns)
PctVars = list(df.filter(regex=("Pct.*")).columns)
df[NumVars] = df[NumVars].fillna(0.0).astype(int)
df[WgtVars] = df[WgtVars].fillna(0.0).astype(int)
df[WgtVars] = df[WgtVars].fillna(0.0).astype(float)

columns = list(df.columns)
columns.remove("TRACT")
columns.insert(0,"TRACT")
df = df[columns]

# call the plenario api to get the geojson format of the census tracts in chicago
tracts  = "http://plenar.io/v1/api/shapes/boundaries_census_tracts_2010/?data_type=json"
r = requests.get(tracts)
json_text = r.text
json_tracts = json.loads(json_text)


# ## add census attributes to census json
for row in df.itertuples(index=False):
    for feature in json_tracts['features']:
        if str(row[0]) == str(feature['properties']['tractce10']):
            colnames = list(df.columns)
            for i in range(len(row)):
                feature['properties'][colnames[i]] = str(row[i])

# save merged datasets to an output geojson file
json_string = json.dumps(json_tracts)
with open('census.json', 'w') as f:
    f.write(json_string)
f.close()
