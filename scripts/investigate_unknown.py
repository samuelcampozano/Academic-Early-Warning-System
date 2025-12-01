"""
Script to investigate Unknown age_grade_status
"""
import sys
sys.path.append('.')
from dotenv import load_dotenv
load_dotenv()
import os
from supabase import create_client

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

response = supabase.table('students').select('*, academic_performance(*)').limit(1500).execute()
students = response.data

print('=' * 60)
print('INVESTIGATING UNKNOWN AGE_GRADE_STATUS')
print('=' * 60)

# Filter to only students with academic records
students_with_grades = [s for s in students if s.get('academic_performance')]
print(f'\nTotal students with academic records: {len(students_with_grades)}')

# Age analysis
ages = [s.get('edad') for s in students_with_grades]
none_ages = sum(1 for a in ages if a is None)
zero_ages = sum(1 for a in ages if a == 0)
valid_ages = sum(1 for a in ages if a and a > 0)
print(f'\nAge Analysis:')
print(f'  None values: {none_ages}')
print(f'  Zero values: {zero_ages}')
print(f'  Valid (>0): {valid_ages}')

# Grado analysis
grados = [s.get('grado') for s in students_with_grades]
none_grados = sum(1 for g in grados if g is None)
empty_grados = sum(1 for g in grados if g == '')
valid_grados = sum(1 for g in grados if g and g != 'Unknown')
print(f'\nGrado Analysis:')
print(f'  None values: {none_grados}')
print(f'  Empty string: {empty_grados}')
print(f'  Valid: {valid_grados}')

# Expected ages
expected_age = {
    '1': 6, '2': 7, '3': 8, '4': 9, '5': 10,
    '6': 11, '7': 12, '8': 13, '9': 14, '10': 15,
    '1BGU': 16, '2BGU': 17, '3BGU': 18
}

# Show students with Unknown status
print('\n' + '=' * 60)
print('STUDENTS THAT WOULD GET UNKNOWN STATUS:')
print('=' * 60)

unknown_count = 0
for s in students_with_grades:
    edad = s.get('edad', 0) or 0
    grado = str(s.get('grado', '')).strip()
    
    exp_age = expected_age.get(grado, None)
    
    # Conditions that lead to Unknown
    if exp_age is None or edad <= 0:
        unknown_count += 1
        if unknown_count <= 15:
            nombre = s.get('nombre', '?')
            apellido = s.get('apellido', '?')
            print(f'  {nombre} {apellido}: edad={edad}, grado="{grado}", expected_age={exp_age}')

print(f'\nTotal Unknown: {unknown_count}')

# Check what grados are causing issues
print('\n' + '=' * 60)
print('UNIQUE GRADO VALUES:')
print('=' * 60)
unique_grados = set(str(s.get('grado', '')).strip() for s in students_with_grades)
for g in sorted(unique_grados):
    count = sum(1 for s in students_with_grades if str(s.get('grado', '')).strip() == g)
    in_expected = 'YES' if g in expected_age else 'NO'
    print(f'  "{g}": {count} students, in expected_age: {in_expected}')
