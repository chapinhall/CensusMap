import json, csv
import pandas as pd
import numpy as np
import argparse

def read_csv(csv_filename,id_csv_col):
    df = pd.read_csv(csv_filename)
    #special formatting for tract
    df = df[pd.notnull(df[id_csv_col])]
    #df[id_csv_col] = df[id_csv_col].astype(int)
    print('CSV file has {} rows to merge'.format(len(df[id_csv_col])))

    # move id column to first position
    columns = list(df.columns)
    columns.remove(id_csv_col)
    columns.insert(0,id_csv_col)
    df = df[columns]
    return df

def read_json(geojson_filename):
    with open(geojson_filename) as f:
        geojson = json.load(f)
    print('Geojson file has {} rows to merge'.format(len(geojson['features'])))
    return geojson

def merge(args):
    df = read_csv(args.csv_filename, args.id_csv_col)
    geojson = read_json(args.geojson_filename)
    # Iniitialize unmatched records
    unmatched_json_records = []
    for feature in geojson['features']:
        unmatched_json_records.append(feature['properties'][args.id_geojson_col])
    matched = 0
    for row in df.itertuples(index=False):
        for feature in geojson['features']:
            #the first position of the df is the id column
            if str(row[0]) == str(feature['properties'][args.id_geojson_col]):
                matched += 1
                unmatched_json_records.remove(str(row[0]))
                colnames = list(df.columns)
                for i in range(len(row)):
                    feature['properties'][colnames[i]] = str(row[i])
    print('Matched {} records'.format(matched))
    write_unmatched(unmatched_json_records,args)

    # save merged datasets to an output geojson file
    json_string = json.dumps(geojson)
    print('Saving file to {}'.format(args.output_name))
    with open(args.output_name, 'w') as f:
        f.write(json_string)
    f.close()

def write_unmatched(unmatched_json_records, args):
    csv_out = args.csv_filename.split("/")[-1].split(".")[0] + "_unmatched.csv"
    with open(csv_out,'w', newline='') as f:
        writer =csv.writer(f)
        writer.writerows([unmatched_json_records])
    print("Unmatched csv records written to {}".format(csv_out))

if __name__=='__main__':
    parser = argparse.ArgumentParser(description='Merge geojson file with attribute csv file.')
    parser.add_argument('csv_filename', type=str,
                    help='Location of attribute data csv file')
    parser.add_argument('geojson_filename', type=str,
                    help='Location of geojson data file')
    parser.add_argument('--id_csv_col', type=str,
                    help='Column Name of ID to merge on in csv file', default = "TRACT")
    parser.add_argument('--id_geojson_col', type=str,
                    help='Column Name of ID to merge on in csv file', default = "tractce10")
    parser.add_argument('--output_name', type=str,
                    help='Name of merged output geojson file')

    args = parser.parse_args()
    print('Merging  {} and {}'.format(args.csv_filename, args.geojson_filename))
    merge(args)
