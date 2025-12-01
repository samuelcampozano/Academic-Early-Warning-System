"""
Script to populate the indice_accesibilidad_geografica field in the database
using distance data from the location CSV files.

Distance Categories (per user specification):
- 'Cercania_Peatonal' (0-1.5 km) -> 'Muy cerca'
- 'Proximidad_Barrial' (1.5-5 km) -> 'Cerca' or 'Moderado'
- 'Larga_Distancia' (>5 km) -> 'Lejos' or 'Muy lejos'

Schema constraint: ('Muy cerca', 'Cerca', 'Moderado', 'Lejos', 'Muy lejos')
"""

import pandas as pd
import os
import sys
import re

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_client import supabase_client

def parse_distance(distance_str):
    """Parse distance string to float, handling European decimal notation."""
    if pd.isna(distance_str) or distance_str == 'N/A' or str(distance_str).strip() == '':
        return None
    
    # Convert to string and replace comma with dot for European notation
    distance_str = str(distance_str).replace(',', '.').strip()
    
    try:
        return float(distance_str)
    except ValueError:
        return None

def categorize_distance(distance_km):
    """
    Categorize distance based on user's specification:
    - Cercania_Peatonal: 0-1.5 km (walkable) -> 'Muy cerca'
    - Proximidad_Barrial: 1.5-5 km (short commute) -> 'Moderado'
    - Larga_Distancia: >5 km (significant travel) -> 'Lejos'
    
    More granular mapping for better ML features:
    - 0-1 km -> 'Muy cerca'
    - 1-2 km -> 'Cerca'
    - 2-5 km -> 'Moderado'
    - 5-10 km -> 'Lejos'
    - >10 km -> 'Muy lejos'
    """
    if distance_km is None:
        return None
    
    if distance_km <= 1.0:
        return 'Muy cerca'
    elif distance_km <= 2.0:
        return 'Cerca'
    elif distance_km <= 5.0:
        return 'Moderado'
    elif distance_km <= 10.0:
        return 'Lejos'
    else:
        return 'Muy lejos'

def normalize_address(address):
    """Normalize address string for matching."""
    if pd.isna(address) or address is None:
        return ''
    
    # Convert to lowercase and strip
    addr = str(address).lower().strip()
    
    # Remove common words and normalize
    addr = addr.replace('barrio ', '').replace('cdla ', '').replace('cdla. ', '')
    addr = addr.replace('urb ', '').replace('urb. ', '').replace('urbanizacion ', '')
    addr = addr.replace('parroquia ', '').replace('calle ', '').replace('av ', '')
    addr = addr.replace('avenida ', '').replace('av. ', '').replace('sector ', '')
    addr = addr.replace('"', '').replace("'", '').replace(',', ' ')
    
    # Remove extra spaces
    addr = ' '.join(addr.split())
    
    return addr

def load_location_data():
    """Load and combine location data from both CSV files."""
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Load both location CSVs
    loc1_path = os.path.join(base_path, 'info ubicacion1.csv')
    loc2_path = os.path.join(base_path, 'info ubicacion 2.csv')
    
    # Read CSV files
    loc1 = pd.read_csv(loc1_path)
    loc2 = pd.read_csv(loc2_path)
    
    print(f"Loaded {len(loc1)} entries from info ubicacion1.csv")
    print(f"Loaded {len(loc2)} entries from info ubicacion 2.csv")
    
    # Combine both
    locations = pd.concat([loc1, loc2], ignore_index=True)
    
    # Parse distances
    locations['distance_km'] = locations['Distancia_Ruta_Km'].apply(parse_distance)
    locations['normalized_address'] = locations['Direccion_Original'].apply(normalize_address)
    
    # Create lookup dictionary (address -> distance)
    address_distance = {}
    for _, row in locations.iterrows():
        if row['distance_km'] is not None:
            norm_addr = row['normalized_address']
            if norm_addr and norm_addr not in address_distance:
                address_distance[norm_addr] = row['distance_km']
    
    print(f"Created address lookup with {len(address_distance)} unique addresses")
    
    return locations, address_distance

def load_student_data():
    """Load student information CSV."""
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    student_path = os.path.join(base_path, 'First page of the students information.csv')
    
    # The file uses semicolon as separator
    students = pd.read_csv(student_path, sep=';', encoding='latin-1')
    print(f"Loaded {len(students)} students from CSV")
    
    return students

def find_best_match(student_address, address_distance):
    """Find the best matching address in our lookup."""
    if pd.isna(student_address) or not student_address:
        return None
    
    norm_student_addr = normalize_address(student_address)
    
    # Direct match
    if norm_student_addr in address_distance:
        return address_distance[norm_student_addr]
    
    # Partial match - find addresses that contain keywords from student address
    best_match = None
    best_score = 0
    
    student_words = set(norm_student_addr.split())
    
    for addr, distance in address_distance.items():
        addr_words = set(addr.split())
        
        # Calculate overlap score
        common_words = student_words & addr_words
        if len(common_words) > 0:
            score = len(common_words) / max(len(student_words), len(addr_words))
            if score > best_score and score > 0.3:  # Minimum threshold
                best_score = score
                best_match = distance
    
    return best_match

def update_database_by_name(student_name_distances):
    """Update the database with distance categories, matching by student name."""
    client = supabase_client.client
    
    updated_count = 0
    error_count = 0
    not_found_count = 0
    
    # Fetch all students from database
    print("Fetching all students from database...")
    all_students = client.table('students').select('id, nombre').execute()
    
    if not all_students.data:
        print("ERROR: Could not fetch students from database!")
        return 0
    
    print(f"Found {len(all_students.data)} students in database")
    
    # Create lookup by normalized name
    db_students = {}
    for s in all_students.data:
        name = s.get('nombre', '').lower().strip()
        # Normalize name for matching
        name = ' '.join(name.split())  # Remove extra spaces
        db_students[name] = s['id']
    
    for full_name, category in student_name_distances.items():
        if category is None:
            continue
        
        # Normalize the name for lookup
        lookup_name = full_name.lower().strip()
        lookup_name = ' '.join(lookup_name.split())
        
        student_id = db_students.get(lookup_name)
        
        if not student_id:
            not_found_count += 1
            continue
        
        try:
            # Update socioeconomic_data for this student
            update_result = client.table('socioeconomic_data').update({
                'indice_accesibilidad_geografica': category
            }).eq('student_id', student_id).execute()
            
            if update_result.data:
                updated_count += 1
                if updated_count % 50 == 0:
                    print(f"Updated {updated_count} students...")
        except Exception as e:
            error_count += 1
            if error_count <= 5:
                print(f"Error updating student {full_name}: {e}")
    
    print(f"\nTotal updated: {updated_count}")
    print(f"Not found in DB: {not_found_count}")
    print(f"Total errors: {error_count}")
    
    return updated_count

def main():
    print("="*60)
    print("DISTANCE DATA POPULATION SCRIPT")
    print("="*60)
    
    # Load location data
    print("\n1. Loading location data...")
    locations, address_distance = load_location_data()
    
    # Show distance distribution in location data
    print("\nDistance distribution in location data:")
    dist_counts = locations.groupby(locations['distance_km'].apply(categorize_distance)).size()
    print(dist_counts)
    
    # Load student data
    print("\n2. Loading student data...")
    students = load_student_data()
    
    # Match students to distances by name
    print("\n3. Matching students to distances...")
    student_name_distances = {}
    matched_count = 0
    
    for _, student in students.iterrows():
        # Build full name
        nombres = student.get('Nombres', '')
        apellidos = student.get('Apellidos', '')
        
        if pd.isna(nombres) or pd.isna(apellidos):
            continue
        
        full_name = f"{str(nombres).strip()} {str(apellidos).strip()}"
        address = student.get('Direccion')
        
        # Find distance for this address
        distance = find_best_match(address, address_distance)
        
        if distance is not None:
            category = categorize_distance(distance)
            student_name_distances[full_name] = category
            matched_count += 1
    
    print(f"Matched {matched_count} students to distance categories")
    
    # Show category distribution
    category_counts = {}
    for cat in student_name_distances.values():
        if cat:
            category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print("\nDistance category distribution for matched students:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat}: {count}")
    
    # Update database
    print("\n4. Updating database...")
    confirm = input("Proceed with database update? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        updated = update_database_by_name(student_name_distances)
        print(f"\nDatabase update complete! {updated} records updated.")
    else:
        print("Database update skipped.")
        
        # Save to CSV for manual review
        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                   'student_distance_mapping.csv')
        
        output_data = []
        for name, category in student_name_distances.items():
            output_data.append({'name': name, 'distance_category': category})
        
        pd.DataFrame(output_data).to_csv(output_path, index=False)
        print(f"Saved mapping to {output_path}")

if __name__ == '__main__':
    main()
