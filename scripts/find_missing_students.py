"""
Script to find students in CSV that are not in the database
and upload them to Supabase
"""
import pandas as pd
import sys
from pathlib import Path
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment
load_dotenv()

# Connect to Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

print("=" * 80)
print("STUDENT DATA ANALYSIS AND UPLOAD")
print("=" * 80)

# Read CSV with students
df_students = pd.read_csv(
    'First page of the students information.csv', 
    sep=';',
    encoding='latin-1'
)
print(f"\n📋 CSV Students: {len(df_students)} total")
print(f"   Columns: {list(df_students.columns)}")

# Get students currently in database
print("\n📊 Fetching students from database...")
result = supabase.table('students').select('id, nombre, grado, quintil').execute()
db_students = result.data
print(f"   Database students: {len(db_students)}")

# Create lookup by name (normalized)
def normalize_name(name):
    if pd.isna(name):
        return ""
    return str(name).lower().strip()

db_names = set()
for s in db_students:
    name = normalize_name(s.get('nombre', ''))
    db_names.add(name)

# Find students in CSV not in database
missing_students = []
csv_names = []

for idx, row in df_students.iterrows():
    nombre = f"{row['Nombres']} {row['Apellidos']}"
    csv_names.append(nombre)
    
    if normalize_name(nombre) not in db_names:
        missing_students.append({
            'csv_id': row['ID'],
            'nombre': nombre,
            'grado': row['Grado'],
            'edad': row['Edad'],
            'quintil': row['Quintil'] if pd.notna(row['Quintil']) else None,
            'direccion': row['Direccion']
        })

print(f"\n🔍 ANALYSIS:")
print(f"   CSV students: {len(df_students)}")
print(f"   Database students: {len(db_students)}")
print(f"   Missing from database: {len(missing_students)}")

if missing_students:
    print(f"\n📝 Sample missing students:")
    for s in missing_students[:5]:
        print(f"   - {s['nombre']} (Grade: {s['grado']}, Quintil: {s['quintil']})")
    
    # Ask before uploading
    print(f"\n⚠️  Found {len(missing_students)} students in CSV that are not in database.")
    
    # Check grades of missing students
    grade_counts = {}
    for s in missing_students:
        g = str(s['grado']).strip()
        grade_counts[g] = grade_counts.get(g, 0) + 1
    
    print(f"\n   Grades distribution of missing students:")
    for g, c in sorted(grade_counts.items()):
        print(f"     {g}: {c} students")

# Also check - what grades do we have in the database?
print(f"\n📊 Database student distribution by grade:")
grade_db = {}
for s in db_students:
    g = s.get('grado', 'Unknown')
    grade_db[g] = grade_db.get(g, 0) + 1

for g, c in sorted(grade_db.items()):
    print(f"   {g}: {c} students")

# Check quintil coverage
print(f"\n📊 Quintil distribution in CSV:")
quintil_csv = df_students['Quintil'].value_counts()
print(quintil_csv)

print(f"\n📊 Quintil distribution in database:")
quintil_db = {}
for s in db_students:
    q = s.get('quintil', 'None')
    quintil_db[q] = quintil_db.get(q, 0) + 1
for q, c in sorted(quintil_db.items(), key=lambda x: str(x[0])):
    print(f"   Q{q}: {c} students")
