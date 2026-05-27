import csv
import random

def generate_mock_data(filename="government_master_data.csv", num_rows=100):
    tehsils = ["Bassi", "Phagi", "Jamwa Ramgarh"]
    status_distribution = {
        "Eligible": 0.60,
        "Fuzzy": 0.25,
        "Ineligible": 0.15
    }
    
    first_names = ["Ramesh", "Suresh", "Ram", "Shyam", "Geeta", "Sita", "Govind", "Sunita", "Anita", "Om"]
    last_names = ["Kumar", "Sharma", "Singh", "Yadav", "Devi", "Meena", "Jat"]

    headers = [
        "id", "name", "father_name", "tehsil", "income", "land_holding_ha", 
        "category", "expected_status" 
    ]
    
    data = []
    
    for i in range(1, num_rows + 1):
        base_first = random.choice(first_names)
        base_last = random.choice(last_names)
        father_name = random.choice(first_names) + " " + random.choice(last_names)
        tehsil = random.choice(tehsils)
        
        # Determine category based on distribution
        rand = random.random()
        if rand < status_distribution["Eligible"]:
            category = "Eligible"
        elif rand < status_distribution["Eligible"] + status_distribution["Fuzzy"]:
            category = "Fuzzy"
        else:
            category = "Ineligible"
            
        if category == "Eligible":
            # Perfect match, good criteria
            name = f"{base_first} {base_last}"
            income = random.randint(50000, 190000)
            land = round(random.uniform(0.1, 1.9), 2)
            expected_status = "STATUS_AUTO_APPROVE"
        elif category == "Fuzzy":
            # Some variation in name, good criteria
            # E.g. government record is Suresh, applicant might be Suresh Kumar
            name = f"{base_first}" # Just first name
            income = random.randint(50000, 190000)
            land = round(random.uniform(0.1, 1.9), 2)
            expected_status = "STATUS_FIELD_VERIFICATION"
        else: # Ineligible
            name = f"{base_first} {base_last}"
            # High income or high land
            if random.choice([True, False]):
                income = random.randint(210000, 500000)
                land = round(random.uniform(0.1, 1.9), 2)
            else:
                income = random.randint(50000, 190000)
                land = round(random.uniform(2.1, 10.0), 2)
            expected_status = "STATUS_REJECTED"
            
        data.append({
            "id": i,
            "name": name,
            "father_name": father_name,
            "tehsil": tehsil,
            "income": income,
            "land_holding_ha": land,
            "category": category,
            "expected_status": expected_status
        })
        
    with open(filename, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
            
    print(f"Successfully generated {num_rows} records in {filename}")

if __name__ == "__main__":
    generate_mock_data()
