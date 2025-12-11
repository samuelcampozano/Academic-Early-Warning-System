"""
Enhanced Early Warning Model Training
=====================================
Includes ALL socioeconomic features + ALL subjects for comprehensive analysis

KEY CHANGES FROM ORIGINAL:
1. Uses AVERAGE score <= 7.5 as target (not min grade)
2. Includes quintil as a feature (not just for weighting)
3. Adds subject-specific analysis to see math/science impact
4. Includes ALL available socioeconomic features

Author: Samuel Campozano
Date: December 2025
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
from catboost import CatBoostClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, balanced_accuracy_score,
    classification_report
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

# Local imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.supabase_client import supabase_client

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'enhanced_model_output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Expected age by grade level
EXPECTED_AGE = {
    '1': 6, '2': 7, '3': 8, '4': 9, '5': 10, 
    '6': 11, '7': 12, '8': 13, '9': 14, '10': 15,
    '1BGU': 16, '2BGU': 17, '3BGU': 18
}

# All subjects for individual tracking
ALL_SUBJECTS = [
    'Lengua y Literatura', 'Matemáticas', 'Matemática',
    'Ciencias Naturales', 'Estudios sociales', 'Inglés',
    'Física', 'Biología', 'Historia', 'Química',
    'Educación ciudadanía', 'Emprendimiento', 'Filosofía',
    'Educación Física', 'Educación Cultural y Artística'
]

# Mathematical/STEM subjects
MATH_STEM_SUBJECTS = [
    'Matemáticas', 'Matemática', 'Física', 'Química',
    'Ciencias Naturales', 'Biología'
]

# Language/Social subjects
LANGUAGE_SOCIAL_SUBJECTS = [
    'Lengua y Literatura', 'Estudios sociales', 'Inglés',
    'Historia', 'Educación ciudadanía', 'Filosofía'
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_nivel_educativo(grado):
    """Map grade to education level category"""
    if str(grado) in ['1', '2', '3', '4']:
        return 'Basica_Elemental'
    elif str(grado) in ['5', '6', '7']:
        return 'Basica_Media'
    elif str(grado) in ['8', '9', '10']:
        return 'Basica_Superior'
    elif str(grado) in ['1BGU', '2BGU', '3BGU']:
        return 'Bachillerato'
    return 'Unknown'

def get_age_grade_status(edad, grado):
    """Determine if student is young/normal/old for their grade"""
    if not edad or not grado or str(grado) not in EXPECTED_AGE:
        return 'unknown'
    
    expected = EXPECTED_AGE[str(grado)]
    diff = edad - expected
    
    if diff < -1:
        return 'young'
    elif diff > 1:
        return 'old'
    return 'normal'

def parse_si_no(value):
    """Convert Si/No to 1/0"""
    if pd.isna(value) or value == '':
        return 0
    return 1 if str(value).strip().upper() == 'SI' else 0

def parse_count(value):
    """Parse count fields like TV, Vehiculos, Celulares"""
    if pd.isna(value) or value == '':
        return 0
    val_str = str(value).strip()
    if '3 o más' in val_str or '4 o más' in val_str or '4 o mas' in val_str:
        return 4
    try:
        return int(val_str)
    except:
        return 0

def parse_bathrooms(value):
    """Parse N_banos text field"""
    if pd.isna(value) or value == '':
        return 1
    val_str = str(value).strip()
    if 'No tiene' in val_str:
        return 0
    elif '3 o más' in val_str:
        return 3
    elif '2' in val_str:
        return 2
    elif '1' in val_str:
        return 1
    return 1

def parse_education_level(value):
    """Convert education level to numeric"""
    if pd.isna(value) or value == '':
        return 2  # Default to secondary incomplete
    
    mapping = {
        'sin estudios': 0, 'ninguno': 0,
        'primaria': 1, 'primaria completa': 1, 'educación básica': 1,
        'secundaria incompleta': 2,
        'secundaria': 3, 'secundaria completa': 3, 'bachillerato': 3,
        'superior': 4, 'educación superior': 4, 'tercer nivel': 4,
        'postgrado': 5, 'cuarto nivel': 5
    }
    
    val_lower = str(value).strip().lower()
    return mapping.get(val_lower, 2)

def normalize_subject(materia):
    """Normalize subject names"""
    if not materia:
        return None
    materia = str(materia).strip()
    # Combine Matemáticas and Matemática
    if materia.lower() in ['matemática', 'matematica']:
        return 'Matemáticas'
    return materia

# ============================================================================
# DATA LOADING
# ============================================================================

def load_all_csv_data():
    """Load all CSV files"""
    base_path = os.path.dirname(os.path.dirname(__file__))
    
    print("Loading CSV files...")
    
    # First Page - Basic student info
    first_page_df = pd.read_csv(
        os.path.join(base_path, 'First page of the students information.csv'),
        sep=';', encoding='latin-1'
    )
    first_page_df.columns = first_page_df.columns.str.strip()
    print(f"  First Page: {len(first_page_df)} records")
    
    # House - Housing information
    house_df = pd.read_csv(
        os.path.join(base_path, 'Information about the house of the student.csv'),
        sep=';', encoding='latin-1'
    )
    house_df.columns = house_df.columns.str.strip()
    print(f"  House: {len(house_df)} records")
    
    # Habit - Habits and assets
    habit_df = pd.read_csv(
        os.path.join(base_path, 'Information about the habit of the student.csv'),
        sep=';', encoding='latin-1'
    )
    habit_df.columns = habit_df.columns.str.strip()
    print(f"  Habit: {len(habit_df)} records")
    
    # Parent - Parent/guardian info
    parent_df = pd.read_csv(
        os.path.join(base_path, 'Information of the parent.orlegalrepresentative.csv'),
        sep=';', encoding='latin-1'
    )
    parent_df.columns = parent_df.columns.str.strip()
    print(f"  Parent: {len(parent_df)} records")
    
    # Economic - Economic activity
    economic_df = pd.read_csv(
        os.path.join(base_path, 'Economic activity of the student.csv'),
        sep=';', encoding='latin-1'
    )
    economic_df.columns = economic_df.columns.str.strip()
    print(f"  Economic: {len(economic_df)} records")
    
    return first_page_df, house_df, habit_df, parent_df, economic_df

# ============================================================================
# DATASET BUILDING
# ============================================================================

def build_enhanced_dataset():
    """Build dataset with ALL features from all sources"""
    print("\n" + "=" * 70)
    print("BUILDING ENHANCED DATASET WITH ALL FEATURES")
    print("=" * 70)
    
    # Load CSV data
    first_page_df, house_df, habit_df, parent_df, economic_df = load_all_csv_data()
    
    # Load students from database (for academic performance)
    print("\nLoading students from database...")
    students = supabase_client.get_students(limit=2000)
    print(f"  Database: {len(students)} students")
    
    # Build records
    records = []
    subject_stats = {}  # Track subject-level stats for analysis
    skipped_no_academic = 0
    skipped_unknown_grade = 0
    
    for student in students:
        student_id = student.get('id', '')
        if not student_id.startswith('EST'):
            continue
        
        try:
            num_id = int(student_id.replace('EST', ''))
        except:
            continue
        
        # Get academic performance for TARGET calculation
        academic = student.get('academic_performance', [])
        if not academic:
            skipped_no_academic += 1
            continue
        
        # Calculate grades by subject
        all_grades = []
        subject_grades = {}
        math_stem_grades = []
        language_social_grades = []
        
        for record in academic:
            materia = normalize_subject(record.get('materia'))
            nota = record.get('nota')
            if nota is not None:
                all_grades.append(float(nota))
                if materia:
                    if materia not in subject_grades:
                        subject_grades[materia] = []
                    subject_grades[materia].append(float(nota))
                    
                    # Track stats by subject type
                    if materia not in subject_stats:
                        subject_stats[materia] = {'total': 0, 'at_risk': 0, 'grades': []}
                    subject_stats[materia]['grades'].append(float(nota))
                    
                    # Categorize by subject type
                    if materia in MATH_STEM_SUBJECTS:
                        math_stem_grades.append(float(nota))
                    if materia in LANGUAGE_SOCIAL_SUBJECTS:
                        language_social_grades.append(float(nota))
        
        if not all_grades:
            skipped_no_academic += 1
            continue
        
        # ============================================================
        # TARGET: AVERAGE SCORE <= 7.5 means AT RISK
        # ============================================================
        avg_grade = np.mean(all_grades)
        at_risk = 1 if avg_grade <= 7.5 else 0
        
        # ============================================================
        # FEATURE: Education Level (from database grado)
        # ============================================================
        grado = student.get('grado', '')
        nivel_educativo = get_nivel_educativo(grado)
        if nivel_educativo == 'Unknown':
            skipped_unknown_grade += 1
            continue
        
        # ============================================================
        # FEATURE: Age-Grade Status
        # ============================================================
        edad_db = student.get('edad')
        age_grade_status = get_age_grade_status(edad_db, grado)
        
        # ============================================================
        # FEATURE: Accessibility (from database)
        # ============================================================
        socio_list = student.get('socioeconomic_data', [])
        socio = socio_list[0] if isinstance(socio_list, list) and len(socio_list) > 0 else {}
        indice_accesibilidad = socio.get('indice_accesibilidad_geografica')
        if not indice_accesibilidad:
            indice_accesibilidad = 'Moderado'
        
        # ============================================================
        # FEATURES FROM FIRST PAGE CSV (including QUINTIL)
        # ============================================================
        fp_row = first_page_df[first_page_df['ID'] == num_id]
        if len(fp_row) > 0:
            fp = fp_row.iloc[0]
            quintil = fp.get('Quintil') if pd.notna(fp.get('Quintil')) else student.get('quintil', 3)
            grupo_socioeconomico = str(fp.get('Grupo socioeconomico', 'Medio Tipico'))
            tiene_diagnostico = 1 if str(fp.get('nombre_Diagnostico psicologico', '')).upper() == 'SI' else 0
            escuela_procedencia = 1 if str(fp.get('Escuela_Procedencia', '')).upper() in ['SI', 'SI '] else 0
        else:
            quintil = student.get('quintil', 3)
            grupo_socioeconomico = 'Medio Tipico'
            tiene_diagnostico = 0
            escuela_procedencia = 0
        
        if pd.isna(quintil):
            quintil = 3
        quintil = int(quintil)
        
        # ============================================================
        # FEATURES FROM HOUSE CSV
        # ============================================================
        house_row = house_df[house_df['ID'] == num_id]
        if len(house_row) > 0:
            house = house_row.iloc[0]
            tipo_vivienda = str(house.get('Tipo vivienda', 'Casa/Villa'))
            material_paredes = str(house.get('Material_Pared', 'Ladrillo'))
            material_piso = str(house.get('Material_Piso', 'Cerámica/Baldosa'))
            cuartos_bano = parse_bathrooms(house.get('N_banos'))
            tipo_sanitario = str(house.get('Servicio_Higienico', 'Conectado a red pública'))
            tiene_internet = parse_si_no(house.get('Internet'))
            tiene_computadora = parse_si_no(house.get('Computadora'))
            tiene_laptop = parse_si_no(house.get('Laptop'))
            num_celulares = parse_count(house.get('Celulares'))
            tipo_agua = str(house.get('Agua', 'Red pública'))
            tipo_electricidad = str(house.get('Tipo_Luz', 'Medidor propio'))
            eliminacion_basura = str(house.get('Eliminacion_basura', 'Servicio municipal'))
        else:
            tipo_vivienda = 'Casa/Villa'
            material_paredes = 'Ladrillo'
            material_piso = 'Cerámica/Baldosa'
            cuartos_bano = 1
            tipo_sanitario = 'Conectado a red pública'
            tiene_internet = 0
            tiene_computadora = 0
            tiene_laptop = 0
            num_celulares = 2
            tipo_agua = 'Red pública'
            tipo_electricidad = 'Medidor propio'
            eliminacion_basura = 'Servicio municipal'
        
        # Clean categorical values
        for var in ['tipo_vivienda', 'material_paredes', 'material_piso', 'tipo_sanitario', 
                   'tipo_agua', 'tipo_electricidad', 'eliminacion_basura']:
            if pd.isna(eval(var)) or eval(var) == 'nan':
                exec(f"{var} = 'Desconocido'")
        
        # ============================================================
        # FEATURES FROM HABIT CSV
        # ============================================================
        habit_row = habit_df[habit_df['ID'] == num_id]
        if len(habit_row) > 0:
            habit = habit_row.iloc[0]
            tiene_telefono = parse_si_no(habit.get('Telefono_convencional'))
            tiene_cocina = parse_si_no(habit.get('Cocina_horno'))
            tiene_refrigeradora = parse_si_no(habit.get('Refrigeradora'))
            tiene_lavadora = parse_si_no(habit.get('Lavadora'))
            tiene_equipo_sonido = parse_si_no(habit.get('Equipo de sonido'))
            num_tv = parse_count(habit.get('TV'))
            num_vehiculos = parse_count(habit.get('Vehiculos'))
            compra_ropa_centros = parse_si_no(habit.get('Compra_Ropa_Centros'))
            usa_internet = parse_si_no(habit.get('Uso_Internet'))
            usa_correo = parse_si_no(habit.get('Uso_correo'))
            usa_redes = parse_si_no(habit.get('Red_social'))
            lectura_libros = parse_si_no(habit.get('Lectura_libros'))
        else:
            tiene_telefono = 0
            tiene_cocina = 1
            tiene_refrigeradora = 1
            tiene_lavadora = 1
            tiene_equipo_sonido = 0
            num_tv = 1
            num_vehiculos = 0
            compra_ropa_centros = 0
            usa_internet = 1
            usa_correo = 1
            usa_redes = 1
            lectura_libros = 0
        
        # ============================================================
        # FEATURES FROM PARENT CSV
        # ============================================================
        parent_row = parent_df[parent_df['ID'] == num_id]
        if len(parent_row) > 0:
            parent = parent_row.iloc[0]
            edad_representante = parent.get('Edad') if pd.notna(parent.get('Edad')) else 35
            relacion = str(parent.get('Relacion', 'Madre'))
            estado_civil = str(parent.get('Estado civil', 'Casado'))
            nivel_instruccion = str(parent.get('Nivel Instruccion', 'Secundaria completa'))
            ocupacion_rep = str(parent.get('Ocupacion', 'Desconocido'))
            sexo_representante = str(parent.get('Sexo', 'Femenino'))
        else:
            edad_representante = 35
            relacion = 'Madre'
            estado_civil = 'Casado'
            nivel_instruccion = 'Secundaria completa'
            ocupacion_rep = 'Desconocido'
            sexo_representante = 'Femenino'
        
        if pd.isna(edad_representante):
            edad_representante = 35
        for var in ['relacion', 'estado_civil', 'nivel_instruccion', 'ocupacion_rep', 'sexo_representante']:
            if pd.isna(eval(var)) or eval(var) == 'nan':
                exec(f"{var} = 'Desconocido'")
        
        nivel_instruccion_num = parse_education_level(nivel_instruccion)
        
        # ============================================================
        # FEATURES FROM ECONOMIC CSV
        # ============================================================
        economic_row = economic_df[economic_df['ID'] == num_id]
        if len(economic_row) > 0:
            economic = economic_row.iloc[0]
            tiene_seguro_salud = parse_si_no(economic.get('Seguro_Salud'))
            tiene_seguro_privado = parse_si_no(economic.get('Seguro_Privado'))
            ocupacion_jefe = str(economic.get('Ocupacion_Jefe', 'Servicios'))
            situacion_laboral = str(economic.get('Situacion_laboral', 'Empleado'))
        else:
            tiene_seguro_salud = 1
            tiene_seguro_privado = 0
            ocupacion_jefe = 'Servicios'
            situacion_laboral = 'Empleado'
        
        if pd.isna(ocupacion_jefe) or ocupacion_jefe == 'nan':
            ocupacion_jefe = 'Servicios'
        if pd.isna(situacion_laboral) or situacion_laboral == 'nan':
            situacion_laboral = 'Empleado'
        
        # ============================================================
        # DERIVED FEATURES
        # ============================================================
        
        # Asset score
        asset_score = (tiene_telefono + tiene_cocina + tiene_refrigeradora + 
                      tiene_lavadora + tiene_equipo_sonido + 
                      (1 if num_vehiculos > 0 else 0))
        
        # Tech score
        tech_score = tiene_internet + tiene_computadora + tiene_laptop
        
        # Digital literacy score
        digital_score = usa_internet + usa_correo + usa_redes
        
        # Transportation indicator (has vehicle)
        has_transportation = 1 if num_vehiculos > 0 else 0
        
        # ============================================================
        # SUBJECT ENROLLMENT FEATURES
        # ============================================================
        num_subjects = len(subject_grades)
        
        # Subject-specific enrollment (binary - takes this subject or not)
        takes_lengua = 1 if 'Lengua y Literatura' in subject_grades else 0
        takes_matematicas = 1 if 'Matemáticas' in subject_grades else 0
        takes_ciencias = 1 if 'Ciencias Naturales' in subject_grades else 0
        takes_sociales = 1 if 'Estudios sociales' in subject_grades else 0
        takes_ingles = 1 if 'Inglés' in subject_grades else 0
        takes_fisica = 1 if 'Física' in subject_grades else 0
        takes_quimica = 1 if 'Química' in subject_grades else 0
        takes_biologia = 1 if 'Biología' in subject_grades else 0
        takes_historia = 1 if 'Historia' in subject_grades else 0
        takes_ciudadania = 1 if 'Educación ciudadanía' in subject_grades else 0
        takes_emprendimiento = 1 if 'Emprendimiento' in subject_grades else 0
        
        # Count of STEM vs Language subjects
        stem_count = sum([takes_matematicas, takes_fisica, takes_quimica, takes_ciencias, takes_biologia])
        language_count = sum([takes_lengua, takes_sociales, takes_ingles, takes_historia, takes_ciudadania])
        
        # Gender
        genero = student.get('genero', 'Masculino')
        if not genero:
            genero = 'Masculino'
        
        # ============================================================
        # BUILD RECORD
        # ============================================================
        record = {
            # Target
            'at_risk': at_risk,
            'avg_grade': round(avg_grade, 2),  # For analysis
            
            # Education structure
            'nivel_educativo': nivel_educativo,
            'age_grade_status': age_grade_status,
            
            # Geographic
            'indice_accesibilidad': indice_accesibilidad,
            
            # Demographics - QUINTIL IS NOW A KEY FEATURE
            'genero': genero,
            'quintil': quintil,  # KEY FEATURE
            'grupo_socioeconomico': grupo_socioeconomico,
            'tiene_diagnostico': tiene_diagnostico,
            'escuela_procedencia': escuela_procedencia,
            
            # Housing - Full details
            'tipo_vivienda': tipo_vivienda,
            'material_paredes': material_paredes,
            'material_piso': material_piso,
            'cuartos_bano': cuartos_bano,
            'tipo_sanitario': tipo_sanitario,
            'tipo_agua': tipo_agua,
            'tipo_electricidad': tipo_electricidad,
            'eliminacion_basura': eliminacion_basura,
            
            # Technology
            'tiene_internet': tiene_internet,
            'tiene_computadora': tiene_computadora,
            'tiene_laptop': tiene_laptop,
            'num_celulares': num_celulares,
            'tech_score': tech_score,
            
            # Household assets
            'tiene_telefono': tiene_telefono,
            'tiene_cocina': tiene_cocina,
            'tiene_refrigeradora': tiene_refrigeradora,
            'tiene_lavadora': tiene_lavadora,
            'tiene_equipo_sonido': tiene_equipo_sonido,
            'num_tv': num_tv,
            'num_vehiculos': num_vehiculos,
            'has_transportation': has_transportation,
            'asset_score': asset_score,
            
            # Digital habits
            'usa_internet': usa_internet,
            'usa_correo': usa_correo,
            'usa_redes': usa_redes,
            'digital_score': digital_score,
            
            # Other habits
            'compra_ropa_centros': compra_ropa_centros,
            'lectura_libros': lectura_libros,
            
            # Family - Parent info
            'edad_representante': int(edad_representante),
            'sexo_representante': sexo_representante,
            'relacion': relacion,
            'estado_civil': estado_civil,
            'nivel_instruccion': nivel_instruccion,
            'nivel_instruccion_num': nivel_instruccion_num,
            'ocupacion_rep': ocupacion_rep,
            
            # Economic
            'tiene_seguro_salud': tiene_seguro_salud,
            'tiene_seguro_privado': tiene_seguro_privado,
            'ocupacion_jefe': ocupacion_jefe,
            'situacion_laboral': situacion_laboral,
            
            # Academic - Subject enrollment
            'num_subjects': num_subjects,
            'takes_lengua': takes_lengua,
            'takes_matematicas': takes_matematicas,
            'takes_ciencias': takes_ciencias,
            'takes_sociales': takes_sociales,
            'takes_ingles': takes_ingles,
            'takes_fisica': takes_fisica,
            'takes_quimica': takes_quimica,
            'takes_biologia': takes_biologia,
            'takes_historia': takes_historia,
            'takes_ciudadania': takes_ciudadania,
            'takes_emprendimiento': takes_emprendimiento,
            'stem_count': stem_count,
            'language_count': language_count,
        }
        
        records.append(record)
    
    print(f"\nSkipped: {skipped_no_academic} no academic, {skipped_unknown_grade} unknown grade")
    
    df = pd.DataFrame(records)
    
    # Clean categorical columns
    cat_cols = ['nivel_educativo', 'age_grade_status', 'indice_accesibilidad', 
                'genero', 'grupo_socioeconomico', 'tipo_vivienda', 'material_paredes',
                'material_piso', 'tipo_sanitario', 'tipo_agua', 'tipo_electricidad',
                'eliminacion_basura', 'sexo_representante', 'relacion', 'estado_civil', 
                'nivel_instruccion', 'ocupacion_rep', 'ocupacion_jefe', 'situacion_laboral']
    
    for col in cat_cols:
        if col in df.columns:
            df[col] = df[col].fillna('Desconocido')
            df[col] = df[col].replace('nan', 'Desconocido')
            df[col] = df[col].astype(str)
    
    print(f"\n✅ Dataset built: {len(df)} students with {len(df.columns)} features")
    
    # Print subject statistics
    print("\n" + "=" * 70)
    print("SUBJECT-LEVEL ANALYSIS")
    print("=" * 70)
    for subj in sorted(subject_stats.keys()):
        stats = subject_stats[subj]
        if len(stats['grades']) > 10:
            avg = np.mean(stats['grades'])
            fail_rate = sum(1 for g in stats['grades'] if g <= 7.0) / len(stats['grades']) * 100
            print(f"  {subj}: n={len(stats['grades'])}, avg={avg:.2f}, fail_rate={fail_rate:.1f}%")
    
    return df, subject_stats

# ============================================================================
# DATA QUALITY CHECK
# ============================================================================

def data_quality_check(df):
    """Print comprehensive data quality statistics"""
    print("\n" + "=" * 70)
    print("DATA QUALITY REPORT")
    print("=" * 70)
    
    # Target distribution
    print(f"\n📊 TARGET DISTRIBUTION (avg_score <= 7.5):")
    at_risk_count = df['at_risk'].sum()
    total = len(df)
    print(f"   At-risk (1): {at_risk_count} ({at_risk_count/total*100:.1f}%)")
    print(f"   Not at-risk (0): {total - at_risk_count} ({(total-at_risk_count)/total*100:.1f}%)")
    
    # Average grade stats
    print(f"\n📈 AVERAGE GRADE STATISTICS:")
    print(f"   Mean: {df['avg_grade'].mean():.2f}")
    print(f"   Std: {df['avg_grade'].std():.2f}")
    print(f"   Min: {df['avg_grade'].min():.2f}")
    print(f"   Max: {df['avg_grade'].max():.2f}")
    
    # Quintil distribution - KEY ANALYSIS
    print(f"\n💰 QUINTIL DISTRIBUTION (KEY FEATURE):")
    for q in sorted(df['quintil'].unique()):
        subset = df[df['quintil'] == q]
        count = len(subset)
        at_risk = subset['at_risk'].sum()
        avg_grade = subset['avg_grade'].mean()
        rate = (at_risk / count * 100) if count > 0 else 0
        print(f"   Quintil {q}: {count} students, {at_risk} at-risk ({rate:.1f}%), avg_grade={avg_grade:.2f}")
    
    # Education level distribution
    print(f"\n📚 EDUCATION LEVEL DISTRIBUTION:")
    for nivel in ['Basica_Elemental', 'Basica_Media', 'Basica_Superior', 'Bachillerato']:
        subset = df[df['nivel_educativo'] == nivel]
        count = len(subset)
        at_risk = subset['at_risk'].sum()
        rate = (at_risk / count * 100) if count > 0 else 0
        print(f"   {nivel}: {count} students, {at_risk} at-risk ({rate:.1f}%)")
    
    # Technology access
    print(f"\n💻 TECHNOLOGY ACCESS:")
    for col in ['tiene_laptop', 'tiene_internet', 'tiene_computadora']:
        has_it = df[df[col] == 1]
        no_has = df[df[col] == 0]
        print(f"   {col}:")
        print(f"      Has (1): {len(has_it)} students, {has_it['at_risk'].sum()} at-risk ({has_it['at_risk'].mean()*100:.1f}%)")
        print(f"      No (0): {len(no_has)} students, {no_has['at_risk'].sum()} at-risk ({no_has['at_risk'].mean()*100:.1f}%)")
    
    return df

# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_and_compare_models(X_train, X_test, y_train, y_test, cat_features, feature_cols):
    """Train multiple models and compare performance"""
    print("\n" + "=" * 70)
    print("MODEL TRAINING AND COMPARISON")
    print("=" * 70)
    
    # Class ratio for weighting
    class_ratio = (y_train == 0).sum() / (y_train == 1).sum()
    print(f"Class ratio (neg/pos): {class_ratio:.2f}")
    
    # Encode categorical features for non-CatBoost models
    X_train_encoded = X_train.copy()
    X_test_encoded = X_test.copy()
    encoders = {}
    
    for col in cat_features:
        le = LabelEncoder()
        all_values = pd.concat([X_train[col], X_test[col]]).astype(str)
        le.fit(all_values)
        X_train_encoded[col] = le.transform(X_train[col].astype(str))
        X_test_encoded[col] = le.transform(X_test[col].astype(str))
        encoders[col] = le
    
    # Scale for SVM
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_encoded)
    X_test_scaled = scaler.transform(X_test_encoded)
    
    # Define models
    models = {
        'Logistic_Regression': LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42,
            C=0.5  # Regularization
        ),
        
        'SVM_RBF': SVC(
            kernel='rbf',
            class_weight='balanced',
            probability=True,
            random_state=42
        ),
        
        'RandomForest': RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ),
        
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            random_state=42
        ),
        
        'XGBoost': XGBClassifier(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            scale_pos_weight=class_ratio,
            random_state=42,
            verbosity=0,
            use_label_encoder=False,
            eval_metric='logloss'
        ),
        
        'LightGBM': LGBMClassifier(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            class_weight='balanced',
            random_state=42,
            verbose=-1
        ),
        
        'CatBoost': CatBoostClassifier(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            auto_class_weights='Balanced',
            cat_features=cat_features,
            verbose=False,
            random_state=42
        ),
    }
    
    results = []
    best_model = None
    best_score = 0
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    for name, model in models.items():
        print(f"\n🔄 Training {name}...")
        
        try:
            # Select appropriate data format
            if name == 'CatBoost':
                X_tr, X_te = X_train, X_test
            elif name == 'SVM_RBF':
                X_tr, X_te = X_train_scaled, X_test_scaled
            else:
                X_tr, X_te = X_train_encoded, X_test_encoded
            
            # Cross-validation
            if name == 'SVM_RBF':
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='roc_auc')
            else:
                cv_scores = cross_val_score(model, X_tr, y_train, cv=cv, scoring='roc_auc')
            
            # Train on full training set
            model.fit(X_tr, y_train)
            
            # Predict
            y_pred = model.predict(X_te)
            y_prob = model.predict_proba(X_te)[:, 1] if hasattr(model, 'predict_proba') else y_pred
            
            # Calculate metrics
            metrics = {
                'model': name,
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, zero_division=0),
                'recall': recall_score(y_test, y_pred),
                'f1': f1_score(y_test, y_pred),
                'roc_auc': roc_auc_score(y_test, y_prob),
                'balanced_accuracy': balanced_accuracy_score(y_test, y_pred),
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
            }
            
            # Confusion matrix details
            tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
            metrics.update({
                'tp': int(tp), 'fp': int(fp), 'fn': int(fn), 'tn': int(tn),
                'missed_at_risk': int(fn),
                'false_alarms': int(fp)
            })
            
            results.append(metrics)
            
            print(f"   CV Score: {metrics['cv_mean']:.4f} ± {metrics['cv_std']:.4f}")
            print(f"   ROC-AUC: {metrics['roc_auc']:.4f}")
            print(f"   Recall: {metrics['recall']:.4f} (missed {fn} at-risk students)")
            
            # Track best model by CV score
            if metrics['cv_mean'] > best_score:
                best_score = metrics['cv_mean']
                best_model = (name, model, metrics)
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    return results, best_model, encoders, scaler

# ============================================================================
# THRESHOLD OPTIMIZATION
# ============================================================================

def optimize_threshold(model, X_test, y_test, model_name):
    """Find optimal threshold for maximizing recall"""
    print("\n" + "=" * 70)
    print("THRESHOLD OPTIMIZATION FOR MAXIMUM RECALL")
    print("=" * 70)
    
    y_prob = model.predict_proba(X_test)[:, 1]
    
    threshold_results = []
    for threshold in [0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1]:
        y_pred = (y_prob >= threshold).astype(int)
        
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        result = {
            'threshold': threshold,
            'recall': recall,
            'precision': precision,
            'f1': f1,
            'tp': int(tp),
            'fp': int(fp),
            'fn': int(fn),
            'tn': int(tn),
            'missed': int(fn),
            'false_alarms': int(fp)
        }
        threshold_results.append(result)
        
        print(f"   Threshold {threshold:.2f}: Recall={recall:.1%}, Precision={precision:.1%}, "
              f"Missed={fn}, False Alarms={fp}")
    
    return threshold_results

# ============================================================================
# FEATURE IMPORTANCE
# ============================================================================

def get_feature_importance(model, feature_names, model_name):
    """Extract feature importance from model"""
    print("\n" + "=" * 70)
    print(f"FEATURE IMPORTANCE ({model_name})")
    print("=" * 70)
    
    importance_data = []
    
    if model_name == 'Logistic_Regression':
        # For logistic regression, coefficients indicate direction and magnitude
        coefs = model.coef_[0]
        for name, coef in zip(feature_names, coefs):
            importance_data.append({
                'feature': name,
                'coefficient': coef,
                'abs_importance': abs(coef),
                'direction': 'risk' if coef > 0 else 'protective'
            })
    elif hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        for name, imp in zip(feature_names, importances):
            importance_data.append({
                'feature': name,
                'importance': imp,
                'abs_importance': imp
            })
    
    # Sort by absolute importance
    importance_data.sort(key=lambda x: x['abs_importance'], reverse=True)
    
    print("\nTop 15 Features:")
    for i, feat in enumerate(importance_data[:15]):
        if 'coefficient' in feat:
            direction = "↑ RISK" if feat['coefficient'] > 0 else "↓ PROTECTIVE"
            print(f"   {i+1}. {feat['feature']}: {feat['coefficient']:.4f} ({direction})")
        else:
            print(f"   {i+1}. {feat['feature']}: {feat['importance']:.4f}")
    
    return importance_data

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main training pipeline"""
    print("\n" + "=" * 70)
    print("ENHANCED EARLY WARNING MODEL TRAINING")
    print("Target: Average Score <= 7.5 means AT RISK")
    print("=" * 70)
    
    # Build dataset
    df, subject_stats = build_enhanced_dataset()
    
    # Data quality check
    df = data_quality_check(df)
    
    # Prepare features
    target_col = 'at_risk'
    exclude_cols = ['at_risk', 'avg_grade']  # avg_grade is for analysis only
    
    feature_cols = [c for c in df.columns if c not in exclude_cols]
    
    # Identify categorical features
    cat_features = [c for c in feature_cols if df[c].dtype == 'object']
    
    print(f"\n📋 FEATURE SUMMARY:")
    print(f"   Total features: {len(feature_cols)}")
    print(f"   Categorical: {len(cat_features)}")
    print(f"   Numeric: {len(feature_cols) - len(cat_features)}")
    
    # Prepare X and y
    X = df[feature_cols]
    y = df[target_col]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 DATA SPLIT:")
    print(f"   Training: {len(X_train)} ({y_train.sum()} at-risk, {y_train.sum()/len(y_train)*100:.1f}%)")
    print(f"   Testing: {len(X_test)} ({y_test.sum()} at-risk, {y_test.sum()/len(y_test)*100:.1f}%)")
    
    # Train models
    results, best_model, encoders, scaler = train_and_compare_models(
        X_train, X_test, y_train, y_test, cat_features, feature_cols
    )
    
    if best_model is None:
        print("\n❌ No models trained successfully!")
        return
    
    best_name, model, best_metrics = best_model
    print(f"\n🏆 BEST MODEL: {best_name}")
    print(f"   CV Score: {best_metrics['cv_mean']:.4f} ± {best_metrics['cv_std']:.4f}")
    
    # Optimize threshold
    if best_name == 'SVM_RBF':
        X_test_for_threshold = scaler.transform(
            X_test.copy().apply(lambda x: encoders[x.name].transform(x.astype(str)) 
                               if x.name in encoders else x)
        )
    elif best_name == 'CatBoost':
        X_test_for_threshold = X_test
    else:
        X_test_encoded = X_test.copy()
        for col in cat_features:
            X_test_encoded[col] = encoders[col].transform(X_test[col].astype(str))
        X_test_for_threshold = X_test_encoded
    
    threshold_results = optimize_threshold(model, X_test_for_threshold, y_test, best_name)
    
    # Get feature importance
    if best_name == 'CatBoost':
        importance_data = get_feature_importance(model, feature_cols, best_name)
    elif best_name in ['Logistic_Regression', 'RandomForest', 'GradientBoosting', 'XGBoost', 'LightGBM']:
        importance_data = get_feature_importance(model, feature_cols, best_name)
    else:
        importance_data = []
    
    # Save results
    report = {
        'timestamp': datetime.now().isoformat(),
        'experiment': 'Enhanced Model with ALL Features including Quintil',
        'target_definition': 'at_risk = 1 if avg_score <= 7.5 else 0',
        'dataset': {
            'total_students': len(df),
            'at_risk_count': int(df['at_risk'].sum()),
            'at_risk_percentage': float(df['at_risk'].mean() * 100),
            'avg_grade_mean': float(df['avg_grade'].mean()),
            'avg_grade_std': float(df['avg_grade'].std()),
            'train_size': len(X_train),
            'test_size': len(X_test)
        },
        'features': {
            'total': len(feature_cols),
            'categorical': len(cat_features),
            'numeric': len(feature_cols) - len(cat_features),
            'categorical_list': cat_features,
            'all_features': feature_cols
        },
        'best_model': {
            'name': best_name,
            **{k: float(v) if isinstance(v, (np.floating, float)) else v 
               for k, v in best_metrics.items() if k != 'model'}
        },
        'all_models': results,
        'threshold_optimization': threshold_results,
        'top_features': importance_data[:20] if importance_data else []
    }
    
    # Save report
    report_path = os.path.join(OUTPUT_DIR, 'enhanced_model_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"\n💾 Report saved: {report_path}")
    
    # Save model
    model_path = os.path.join(OUTPUT_DIR, 'best_model.joblib')
    joblib.dump(model, model_path)
    print(f"💾 Model saved: {model_path}")
    
    # Save encoders
    encoders_path = os.path.join(OUTPUT_DIR, 'encoders.joblib')
    joblib.dump(encoders, encoders_path)
    print(f"💾 Encoders saved: {encoders_path}")
    
    # Save results CSV
    results_df = pd.DataFrame(results)
    results_path = os.path.join(OUTPUT_DIR, 'model_comparison_results.csv')
    results_df.to_csv(results_path, index=False)
    print(f"💾 Results CSV saved: {results_path}")
    
    print("\n" + "=" * 70)
    print("✅ ENHANCED MODEL TRAINING COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    main()
