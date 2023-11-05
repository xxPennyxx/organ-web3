import csv
import json

# CSV file path
csv_file = './hospital_directory.csv'

# JSON file path (where you want to export the data)
json_file = 'data.json'

# Initialize an empty list to store the CSV data
data = []

# Read CSV and convert it into a list of dictionaries
with open(csv_file, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        data.append(row)

# Write the data to a JSON file
with open(json_file, 'w') as json_file:
    json.dump(data, json_file, indent=4)

print(f"Data has been successfully converted and saved to {json_file}")
