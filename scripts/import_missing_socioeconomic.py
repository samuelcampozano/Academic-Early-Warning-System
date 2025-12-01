"""
Import Missing Socioeconomic Data from CSV files
=================================================

The database is missing these important columns from the INEC model:
- telefono_convencional
- cocina_horno  
- refrigeradora
- lavadora
- equipo_sonido
- numero_tv
- numero_vehiculos
- material_paredes
- material_piso
- cuartos_bano
- tipo_sanitario
- compra_centros_comerciales
- usa_redes_sociales
- usa_correo

This script reads the CSV files and updates the database.
"""

import os
import sys
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Connect to Supabase
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

print("=" * 70)
print("IMPORTING MISSING SOCIOECONOMIC DATA")
print("=" * 70)

# Read CSV files
print("\n📥 Reading CSV files...")

habit_df = pd.read_csv('Information about the habit of the student.csv', sep=';', encoding='latin-1')
house_df = pd.read_csv('Information about the house of the student.csv', sep=';', encoding='latin-1')

print(f"  Habit CSV: {len(habit_df)} rows")
print(f"  House CSV: {len(house_df)} rows")

# Merge on ID_Estudiante
merged = pd.merge(habit_df, house_df, on='ID_Estudiante', how='outer', suffixes=('_habit', '_house'))
print(f"  Merged: {len(merged)} rows")

# Get existing socioeconomic records
print("\n📊 Fetching existing socioeconomic_data records...")
response = supabase.table('socioeconomic_data').select('id, student_id').execute()
existing = {r['student_id']: r['id'] for r in response.data}
print(f"  Found {len(existing)} existing records")

# Helper functions
def parse_yes_no(val):
    """Convert Si/No to boolean"""
    if pd.isna(val):
        return None
    return str(val).strip().lower() in ['si', 'sí', 'yes', '1', 'true']

def parse_tv_count(val):
    """Convert TV count (0, 1, 2, 3 o más) to integer"""
    if pd.isna(val):
        return 0
    val = str(val).strip()
    if val in ['3 o más', '3 o mas', '4 o más', '4 o mas']:
        return 3
    try:
        return int(val)
    except:
        return 0

def parse_vehicle_count(val):
    """Convert vehicle count to integer"""
    if pd.isna(val):
        return 0
    try:
        return int(val)
    except:
        return 0

def parse_bathroom_count(val):
    """Convert bathroom description to count"""
    if pd.isna(val):
        return 1
    val = str(val).lower()
    if 'no tiene' in val:
        return 0
    if '3 o más' in val or '3 o mas' in val:
        return 3
    if '2 cuartos' in val:
        return 2
    if '1 cuarto' in val:
        return 1
    return 1

# Process and update
print("\n🔄 Processing and updating records...")
updated = 0
errors = 0

for idx, row in merged.iterrows():
    student_num = row['ID_Estudiante']
    student_id = f"EST{str(int(student_num)).zfill(3)}"
    
    if student_id not in existing:
        # Skip students not in database
        continue
    
    record_id = existing[student_id]
    
    # Build update data
    update_data = {}
    
    # From Habit CSV
    if 'Telefono_convencional' in row:
        update_data['telefono_convencional'] = parse_yes_no(row['Telefono_convencional'])
    if 'Cocina_horno' in row:
        update_data['cocina_horno'] = parse_yes_no(row['Cocina_horno'])
    if 'Refrigeradora' in row:
        update_data['refrigeradora'] = parse_yes_no(row['Refrigeradora'])
    if 'Lavadora' in row:
        update_data['lavadora'] = parse_yes_no(row['Lavadora'])
    if 'Equipo de sonido' in row:
        update_data['equipo_sonido'] = parse_yes_no(row['Equipo de sonido'])
    if 'TV' in row:
        update_data['numero_tv'] = parse_tv_count(row['TV'])
    if 'Vehiculos' in row:
        update_data['numero_vehiculos'] = parse_vehicle_count(row['Vehiculos'])
    if 'Compra_Ropa_Centros' in row:
        update_data['compra_centros_comerciales'] = parse_yes_no(row['Compra_Ropa_Centros'])
    if 'Uso_correo' in row:
        update_data['correo_electronico'] = parse_yes_no(row['Uso_correo'])
    if 'Red_social' in row:
        update_data['redes_sociales'] = parse_yes_no(row['Red_social'])
    
    # From House CSV
    if 'Material_Pared' in row and pd.notna(row['Material_Pared']):
        update_data['material_paredes'] = str(row['Material_Pared']).strip()
    if 'Material_Piso' in row and pd.notna(row['Material_Piso']):
        update_data['material_piso'] = str(row['Material_Piso']).strip()
    if 'N_banos' in row:
        update_data['cuartos_bano'] = parse_bathroom_count(row['N_banos'])
    if 'Servicio_Higienico ' in row and pd.notna(row['Servicio_Higienico ']):
        update_data['tipo_sanitario'] = str(row['Servicio_Higienico ']).strip()
    
    # Only update if we have data
    if update_data:
        try:
            supabase.table('socioeconomic_data').update(update_data).eq('id', record_id).execute()
            updated += 1
            if updated % 50 == 0:
                print(f"  Updated {updated} records...")
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  Error updating {student_id}: {e}")

print(f"\n✅ Updated {updated} records")
if errors:
    print(f"⚠️  {errors} errors occurred")

# Verify the update
print("\n📊 Verifying update - checking sample records...")
response = supabase.table('socioeconomic_data').select('*').limit(5).execute()
if response.data:
    sample = response.data[0]
    print("\nSample record after update:")
    for key in ['telefono_convencional', 'cocina_horno', 'refrigeradora', 'lavadora', 
                'equipo_sonido', 'numero_tv', 'numero_vehiculos', 'material_paredes',
                'material_piso', 'cuartos_bano', 'tipo_sanitario', 'redes_sociales']:
        if key in sample:
            print(f"  {key}: {sample.get(key)}")
        else:
            print(f"  {key}: [COLUMN NOT IN DB]")

print("\n" + "=" * 70)
print("IMPORT COMPLETE")
print("=" * 70)
