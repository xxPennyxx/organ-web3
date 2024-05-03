import heapq
from geopy.distance import geodesic
import json

# Same antigen_frequencies dictionary as provided before

# Classes for Patient and Donor remain largely unchanged
#HLA Human Leukocyte Antigens
antigen_frequencies = {
    'A': 0.25,
    'B': 0.20,
    'BW': 0.15,
    'C': 0.10,
    'DR': 0.30,
    'DQB1': 0.05,
    'DQA1': 0.04,
    'DPB1': 0.03,
    'DPA1': 0.02,
    'DR51': 0.01,
    'DR52': 0.01,
    'DR53': 0.01
}

class Patient:
    def __init__(self, id, blood_group, tissue_type, latitude, longitude, urgency, age, immune_compatibility, antibodies, organ_specific_data, organ_needed):
        self.id = id
        self.blood_group = blood_group
        self.tissue_type = tissue_type
        self.latitude = latitude
        self.longitude = longitude
        self.urgency = urgency
        self.age = age
        self.immune_compatibility = immune_compatibility
        self.antibodies = antibodies
        self.organ_specific_data = organ_specific_data
        self.organ_needed = organ_needed  # Organ the patient needs

class Donor:
    def __init__(self, id, blood_group, tissue_type, latitude, longitude, organ_specific_data, organ_donated):
        self.id = id
        self.blood_group = blood_group
        self.tissue_type = tissue_type
        self.latitude = latitude
        self.longitude = longitude
        self.organ_specific_data = organ_specific_data
        self.organ_donated = organ_donated  # Organ the donor can provide


def load_patients(filename):
    with open(filename, 'r') as file:
        patients_data = json.load(file)
    patients = [Patient(**data) for data in patients_data]
    return patients

def load_donors(filename):
    with open(filename, 'r') as file:
        donors_data = json.load(file)
    donors = [Donor(**data) for data in donors_data]
    return donors

# The calculate_cpra, calculate_geographic_score functions remain unchanged

def calculate_cpra(antigen_frequencies, patient_antibodies):
    product = 1.0
    for antibody in patient_antibodies:
        if antibody in antigen_frequencies:
            product *= (1 - antigen_frequencies[antibody])
    return (1 - product) * 100  # Convert to percentage

def calculate_geographic_score(patient_location, donor_location):
    distance = geodesic(patient_location, donor_location).kilometers
    if distance < 50:
        return 3
    elif distance < 100:
        return 2
    elif distance < 200:
        return 1
    return 0

def calculate_match_score(patient, donor):
    match_score = 0
    if patient.organ_needed == donor.organ_donated:
        if patient.organ_specific_data['organ_size'] == donor.organ_specific_data.get('organ_size'):
            match_score += 5
        if patient.blood_group == donor.blood_group:
            match_score += 10
        if patient.tissue_type == donor.tissue_type:
            match_score += 10

        cpra_score = calculate_cpra(antigen_frequencies, patient.antibodies)
        geographic_score = calculate_geographic_score((patient.latitude, patient.longitude), (donor.latitude, donor.longitude))
        
        match_score += 100 - cpra_score
        match_score += geographic_score
        if 'organ_size' in patient.organ_specific_data and patient.organ_specific_data['organ_size'] == donor.organ_specific_data['organ_size']:
            match_score += 1
        if patient.urgency == 'urgent':
            match_score += 1
        if patient.urgency == 'high':
            match_score += 2
        if patient.organ_specific_data.get('survival_likelihood', 0) > 80:
            match_score += 1
        if patient.organ_specific_data.get('pediatric', False):
            match_score += 2
        if patient.organ_specific_data.get('prior_living_donor', False):
            match_score += 1
    return round(match_score, 3)

def allocate_organ(patients, donors):
    matches = []
    for patient in patients:
        organ_needed = patient.organ_specific_data.get('organ_needed')  # Make sure the key matches your data structure
        best_match = organ_needed
        highest_score = -float('inf')
        
        # Filter donors to only those who have the organ that is needed by the patient
        suitable_donors = [donor for donor in donors if donor.organ_specific_data.get('organ_donated') == organ_needed]
        
        for donor in suitable_donors:
            score = calculate_match_score(patient, donor)
            if score > highest_score:
                highest_score = score
                best_match = donor

        if best_match:
            matches.append((patient, best_match))
            donors.remove(best_match)  # Remove the matched donor from the available pool

    return matches

# You can then load data and execute the allocation as before:
patients = load_patients('patients.json')
donors = load_donors('donors.json')
allocations = allocate_organ(patients, donors)

n = len(patients)
match_category = ["very low"] * n
data_pass_patient = []
data_pass_donor = []

print("Organ Allocations:")
for patient, donor in allocations:
    cpra = round(calculate_cpra(antigen_frequencies, patient.antibodies), 2)
    match = calculate_match_score(patient, donor)
    if match >= 33.750 and match < 67.500:
        match_category.append("low")
    elif match >= 67.500 and match < 101.250:
        match_category.append("high")
    elif match >= 101.250 and match < 135.000:
        match_category.append("very high")
        data_pass_patient.append({
        'id': patient.id,
        'blood_group': patient.blood_group,
        'tissue_type': patient.tissue_type,
        'latitude': patient.latitude,
        'longitude': patient.longitude,
        'urgency': patient.urgency,
        'age': patient.age,
        'immune_compatibility': patient.immune_compatibility,
        'antibodies': patient.antibodies,
        'organ_specific_data': patient.organ_specific_data,
        'organ_needed': patient.organ_needed})
        data_pass_donor.append({
        'id': donor.id,
        'blood_group': donor.blood_group,
        'tissue_type': donor.tissue_type,
        'latitude': donor.latitude,
        'longitude': donor.longitude,
            "organ_specific_data": {
        "organ_size": donor.organ_specific_data.get('organ_size'),
        "height": donor.organ_specific_data.get('height'),
        "weight": donor.organ_specific_data.get('weight')
    },
    "organ_donated": donor.organ_donated})
    print(f"Patient with ID: {patient.id} closely matches with donor ID: {donor.id}, {patient.organ_needed} is suggested for a transplant based on the scores, \n with a CPRA score: ", cpra, "and an OPTN metric-based match score: ", match)

#print(data_pass_donor)
#print(len(data_pass)/n * 100)
####VISUALISATIONim

def save_data_to_json(data, filename):
    with open('Central_Model_pass_patient.json', 'w') as file:
        json.dump(data, file, indent=4)  # Use indent for pretty-printing
    #print(f"Data successfully written to {'Central_Model_pass_patient.json'}")

def save_dat(data, filename):
    with open('Central_Model_pass_donor.json', 'w') as file:
        json.dump(data, file, indent=4)  # Use indent for pretty-printing
    #print(f"Data successfully written to {'Central_Model_pass_donor.json'}")


save_data_to_json(data_pass_patient, 'Central_Model_pass_patient.json')
save_dat(data_pass_donor, 'Central_Model_pass_donor.json')


"""import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Assuming 'allocations' is a list of tuples (patient, donor) from your allocate_organ function
# First, let's convert this data into a format that can be easily plotted:

data = {
    "Patient ID": [],
    "Donor ID": [],
    "Match Score": [],
    "CPRA Score": [],
    "Organ Needed": []
}

for patient, donor in allocations:
    data["Patient ID"].append(patient.id)
    data["Donor ID"].append(donor.id)
    data["Match Score"].append(calculate_match_score(patient, donor))
    data["CPRA Score"].append(calculate_cpra(antigen_frequencies, patient.antibodies))
    data["Organ Needed"].append(patient.organ_needed)

df = pd.DataFrame(data)

# Now, let's create some visualizations

# Visualization 1: Match Score Distribution by Organ Needed
plt.figure(figsize=(10, 6))
sns.boxplot(x='Organ Needed', y='Match Score', data=df)
plt.title('Match Score Distribution by Organ Needed')
plt.ylabel('Match Score')
plt.xlabel('Organ Type')
plt.show()

# Visualization 2: CPRA Score vs Match Score Scatter Plot
plt.figure(figsize=(10, 6))
sns.scatterplot(x='CPRA Score', y='Match Score', hue='Organ Needed', data=df, palette='bright')
plt.title('CPRA Score vs Match Score')
plt.xlabel('CPRA Score (%)')
plt.ylabel('Match Score')
plt.show()

# Visualization 3: Bar Graph of Match Scores for each Patient-Donor Pair
plt.figure(figsize=(12, 8))
sns.barplot(x='Patient ID', y='Match Score', hue='Donor ID', data=df, dodge=False)
plt.title('Match Scores by Patient and Donor ID')
plt.xlabel('Patient ID')
plt.ylabel('Match Score')
plt.xticks(rotation=45)
plt.legend(title='Donor ID')
plt.show()

# You can create additional plots as needed based on the specific analysis or presentation requirements.
"""