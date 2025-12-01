"""
Comprehensive Early Warning Model Training
==========================================
Uses ALL available data from CSV files + Database

DATA SOURCES:
- First Page CSV: Basic student info, quintil, diagnostico, grupo socioeconomico
- House CSV: Housing type, materials, bathrooms, tech (laptop, internet, computadora, celulares)
- Habit CSV: Assets (TV, vehicles, appliances), digital habits, reading
- Parent CSV: Age, relationship, marital status, education, occupation
- Economic CSV: Health insurance, private insurance, head of household occupation
- Database: Academic performance (grades by subject), grado, edad

FEATURES INCLUDED:
1. nivel_educativo - Education level category (Basica_Elemental/Media/Superior, Bachillerato)
2. age_grade_status - Whether student is young/normal/old for their grade
3. indice_accesibilidad_geografica - Distance to school (categorical)
4. Subject-specific grades and failure indicators
5. ALL socioeconomic features from CSV files

EXCLUDED (Data Leakage Prevention):
- edad (raw) - replaced by age_grade_status
- grado (raw) - replaced by nivel_educativo

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
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, balanced_accuracy_score,
    classification_report
)
from sklearn.preprocessing import LabelEncoder
import joblib

# Local imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.supabase_client import supabase_client

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'comprehensive_model_output')
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

# High-risk subjects (based on failure rate analysis)
HIGH_RISK_SUBJECTS = [
    'Lengua y Literatura', 'Matemáticas', 'Matemática',
    'Física', 'Emprendimiento', 'Ciencias Naturales',
    'Educación ciudadanía', 'Inglés'
]

# Core academic subjects (for individual grade tracking)
CORE_SUBJECTS = [
    'Lengua y Literatura', 'Matemáticas', 'Matemática',
    'Ciencias Naturales', 'Estudios sociales', 'Inglés',
    'Física', 'Biología', 'Historia'
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

def build_comprehensive_dataset():
    """Build dataset with ALL features from all sources"""
    print("\n" + "=" * 70)
    print("BUILDING COMPREHENSIVE DATASET")
    print("=" * 70)
    
    # Load CSV data
    first_page_df, house_df, habit_df, parent_df, economic_df = load_all_csv_data()
    
    # Load students from database (for academic performance)
    print("\nLoading students from database...")
    students = supabase_client.get_students(limit=2000)
    print(f"  Database: {len(students)} students")
    
    # Build records
    records = []
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
        grades = []
        subject_grades = {}
        for record in academic:
            materia = normalize_subject(record.get('materia'))
            nota = record.get('nota')
            if nota is not None:
                grades.append(float(nota))
                if materia:
                    if materia not in subject_grades:
                        subject_grades[materia] = []
                    subject_grades[materia].append(float(nota))
        
        if not grades:
            skipped_no_academic += 1
            continue
        
        # TARGET: at_risk if ANY subject grade <= 7.5
        min_grade = min(grades)
        at_risk = 1 if min_grade <= 7.5 else 0
        
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
            indice_accesibilidad = 'Moderado'  # Default
        
        # ============================================================
        # FEATURES FROM FIRST PAGE CSV
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
        
        # Clean categorical values
        if pd.isna(tipo_vivienda) or tipo_vivienda == 'nan':
            tipo_vivienda = 'Casa/Villa'
        if pd.isna(material_paredes) or material_paredes == 'nan':
            material_paredes = 'Ladrillo'
        if pd.isna(material_piso) or material_piso == 'nan':
            material_piso = 'Cerámica/Baldosa'
        if pd.isna(tipo_sanitario) or tipo_sanitario == 'nan':
            tipo_sanitario = 'Conectado a red pública'
        
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
        else:
            edad_representante = 35
            relacion = 'Madre'
            estado_civil = 'Casado'
            nivel_instruccion = 'Secundaria completa'
            ocupacion_rep = 'Desconocido'
        
        if pd.isna(edad_representante):
            edad_representante = 35
        if pd.isna(relacion) or relacion == 'nan':
            relacion = 'Madre'
        if pd.isna(estado_civil) or estado_civil == 'nan':
            estado_civil = 'Casado'
        if pd.isna(nivel_instruccion) or nivel_instruccion == 'nan':
            nivel_instruccion = 'Secundaria completa'
        
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
        else:
            tiene_seguro_salud = 1
            tiene_seguro_privado = 0
            ocupacion_jefe = 'Servicios'
        
        if pd.isna(ocupacion_jefe) or ocupacion_jefe == 'nan':
            ocupacion_jefe = 'Servicios'
        
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
        
        # ============================================================
        # SUBJECT-SPECIFIC FEATURES (NO GRADES - THEY ARE THE TARGET!)
        # ============================================================
        # IMPORTANT: We only track WHICH subjects the student takes,
        # NOT their grades (that would be data leakage)
        
        # Number of subjects enrolled
        num_subjects = len(subject_grades)
        
        # Count of high-risk subjects student is taking
        # These subjects have historically higher failure rates
        high_risk_count = sum(1 for s in subject_grades.keys() if s in HIGH_RISK_SUBJECTS)
        
        # Subject enrollment indicators (not grades!)
        takes_lengua = 1 if 'Lengua y Literatura' in subject_grades else 0
        takes_matematicas = 1 if 'Matemáticas' in subject_grades else 0
        takes_ciencias = 1 if 'Ciencias Naturales' in subject_grades else 0
        takes_sociales = 1 if 'Estudios sociales' in subject_grades else 0
        takes_ingles = 1 if 'Inglés' in subject_grades else 0
        takes_fisica = 1 if 'Física' in subject_grades else 0
        
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
            
            # Education structure
            'nivel_educativo': nivel_educativo,
            'age_grade_status': age_grade_status,
            
            # Geographic
            'indice_accesibilidad': indice_accesibilidad,
            
            # Demographics
            'genero': genero,
            'quintil': int(quintil),
            'grupo_socioeconomico': grupo_socioeconomico,
            'tiene_diagnostico': tiene_diagnostico,
            'escuela_procedencia': escuela_procedencia,
            
            # Housing
            'tipo_vivienda': tipo_vivienda,
            'material_paredes': material_paredes,
            'material_piso': material_piso,
            'cuartos_bano': cuartos_bano,
            'tipo_sanitario': tipo_sanitario,
            
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
            'asset_score': asset_score,
            
            # Digital habits
            'usa_internet': usa_internet,
            'usa_correo': usa_correo,
            'usa_redes': usa_redes,
            'digital_score': digital_score,
            
            # Other habits
            'compra_ropa_centros': compra_ropa_centros,
            'lectura_libros': lectura_libros,
            
            # Family
            'edad_representante': int(edad_representante),
            'relacion': relacion,
            'estado_civil': estado_civil,
            'nivel_instruccion_num': nivel_instruccion_num,
            
            # Economic
            'tiene_seguro_salud': tiene_seguro_salud,
            'tiene_seguro_privado': tiene_seguro_privado,
            'ocupacion_jefe': ocupacion_jefe,
            
            # Academic - Subject enrollment (NOT grades!)
            'num_subjects': num_subjects,
            'high_risk_subject_count': high_risk_count,
            'takes_lengua': takes_lengua,
            'takes_matematicas': takes_matematicas,
            'takes_ciencias': takes_ciencias,
            'takes_sociales': takes_sociales,
            'takes_ingles': takes_ingles,
            'takes_fisica': takes_fisica,
        }
        
        records.append(record)
    
    print(f"\nSkipped: {skipped_no_academic} no academic, {skipped_unknown_grade} unknown grade")
    
    df = pd.DataFrame(records)
    
    # Clean categorical columns
    cat_cols = ['nivel_educativo', 'age_grade_status', 'indice_accesibilidad', 
                'genero', 'grupo_socioeconomico', 'tipo_vivienda', 'material_paredes',
                'material_piso', 'tipo_sanitario', 'relacion', 'estado_civil', 'ocupacion_jefe']
    
    for col in cat_cols:
        df[col] = df[col].fillna('Desconocido')
        df[col] = df[col].replace('nan', 'Desconocido')
        df[col] = df[col].astype(str)
    
    print(f"\n✅ Dataset built: {len(df)} students with {len(df.columns)} features")
    
    return df

# ============================================================================
# DATA QUALITY CHECK
# ============================================================================

def data_quality_check(df):
    """Print comprehensive data quality statistics"""
    print("\n" + "=" * 70)
    print("DATA QUALITY REPORT")
    print("=" * 70)
    
    # Target distribution
    print(f"\n📊 TARGET DISTRIBUTION:")
    at_risk_count = df['at_risk'].sum()
    total = len(df)
    print(f"   At-risk (1): {at_risk_count} ({at_risk_count/total*100:.1f}%)")
    print(f"   Not at-risk (0): {total - at_risk_count} ({(total-at_risk_count)/total*100:.1f}%)")
    
    # Education level distribution
    print(f"\n📚 EDUCATION LEVEL DISTRIBUTION:")
    for nivel in ['Basica_Elemental', 'Basica_Media', 'Basica_Superior', 'Bachillerato']:
        subset = df[df['nivel_educativo'] == nivel]
        count = len(subset)
        at_risk = subset['at_risk'].sum()
        rate = (at_risk / count * 100) if count > 0 else 0
        print(f"   {nivel}: {count} students, {at_risk} at-risk ({rate:.1f}%)")
    
    # Age-grade status
    print(f"\n📅 AGE-GRADE STATUS:")
    for status in df['age_grade_status'].unique():
        subset = df[df['age_grade_status'] == status]
        count = len(subset)
        at_risk = subset['at_risk'].sum()
        rate = (at_risk / count * 100) if count > 0 else 0
        print(f"   {status}: {count} students, {at_risk} at-risk ({rate:.1f}%)")
    
    # Accessibility
    print(f"\n🚌 ACCESSIBILITY (Distance to School):")
    for acc in ['Muy cerca', 'Cerca', 'Moderado', 'Lejos', 'Muy lejos']:
        subset = df[df['indice_accesibilidad'] == acc]
        count = len(subset)
        if count > 0:
            at_risk = subset['at_risk'].sum()
            rate = (at_risk / count * 100)
            print(f"   {acc}: {count} students, {at_risk} at-risk ({rate:.1f}%)")
    
    # Quintil distribution
    print(f"\n💰 QUINTIL DISTRIBUTION:")
    for q in sorted(df['quintil'].unique()):
        subset = df[df['quintil'] == q]
        count = len(subset)
        at_risk = subset['at_risk'].sum()
        rate = (at_risk / count * 100) if count > 0 else 0
        print(f"   Quintil {q}: {count} students, {at_risk} at-risk ({rate:.1f}%)")
    
    # Feature completeness
    print(f"\n✅ FEATURE COMPLETENESS:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        missing = df[col].isna().sum()
        zeros = (df[col] == 0).sum()
        if missing > 0 or (zeros > len(df) * 0.9):  # Flag if >90% zeros
            print(f"   ⚠️ {col}: {missing} missing, {zeros} zeros ({zeros/len(df)*100:.1f}%)")
    
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
        # Fit on combined train+test to handle unseen labels
        all_values = pd.concat([X_train[col], X_test[col]]).astype(str)
        le.fit(all_values)
        X_train_encoded[col] = le.transform(X_train[col].astype(str))
        X_test_encoded[col] = le.transform(X_test[col].astype(str))
        encoders[col] = le
    
    # Define models
    models = {
        # BASE MODEL - Simple Logistic Regression
        'Logistic_Regression': LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42
        ),
        
        # BASELINE - Random Forest
        'RandomForest': RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ),
        
        # ADVANCED - Gradient Boosting
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            random_state=42
        ),
        
        # ADVANCED - XGBoost
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
        
        # ADVANCED - LightGBM
        'LightGBM': LGBMClassifier(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            class_weight='balanced',
            random_state=42,
            verbose=-1
        ),
        
        # BEST FOR CATEGORICAL - CatBoost Balanced
        'CatBoost_Balanced': CatBoostClassifier(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            auto_class_weights='Balanced',
            cat_features=cat_features,
            verbose=False,
            random_state=42
        ),
        
        # CatBoost with scale_pos_weight
        'CatBoost_Scaled': CatBoostClassifier(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            scale_pos_weight=class_ratio,
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
        print(f"\nTraining {name}...")
        
        try:
            # Use appropriate data
            if 'CatBoost' in name:
                model.fit(X_train, y_train, eval_set=(X_test, y_test), verbose=False)
                y_pred = model.predict(X_test)
                y_prob = model.predict_proba(X_test)[:, 1]
                cv_data = X_train
            else:
                model.fit(X_train_encoded, y_train)
                y_pred = model.predict(X_test_encoded)
                y_prob = model.predict_proba(X_test_encoded)[:, 1]
                cv_data = X_train_encoded
            
            # Metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            roc_auc = roc_auc_score(y_test, y_prob)
            bal_acc = balanced_accuracy_score(y_test, y_pred)
            
            tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
            
            # Cross-validation
            if 'CatBoost' in name:
                cv_scores = cross_val_score(model, cv_data, y_train, cv=cv, scoring='roc_auc')
            else:
                cv_scores = cross_val_score(model, cv_data, y_train, cv=cv, scoring='roc_auc')
            
            result = {
                'model': name,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'roc_auc': roc_auc,
                'balanced_accuracy': bal_acc,
                'tp': int(tp), 'fp': int(fp), 'fn': int(fn), 'tn': int(tn),
                'missed_at_risk': int(fn),
                'false_alarms': int(fp),
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
            results.append(result)
            
            # Composite score prioritizing recall
            composite = 0.4 * roc_auc + 0.4 * recall + 0.2 * precision
            
            print(f"  ROC-AUC: {roc_auc:.3f} | Recall: {recall:.3f} | Precision: {precision:.3f}")
            print(f"  Missed: {fn} | False Alarms: {fp} | CV: {cv_scores.mean():.3f}±{cv_scores.std():.3f}")
            
            # Track best model - also save appropriate test data
            if composite > best_score:
                best_score = composite
                best_model = (name, model, X_test if 'CatBoost' in name else X_test_encoded)
                
        except Exception as e:
            print(f"  ERROR: {e}")
            continue
    
    return results, best_model

# ============================================================================
# THRESHOLD OPTIMIZATION
# ============================================================================

def optimize_thresholds(model, X_test, y_test):
    """Find optimal threshold for different use cases"""
    print("\n" + "=" * 70)
    print("THRESHOLD OPTIMIZATION")
    print("=" * 70)
    
    y_prob = model.predict_proba(X_test)[:, 1]
    
    thresholds_analysis = []
    for threshold in [0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10]:
        y_pred_t = (y_prob >= threshold).astype(int)
        
        recall = recall_score(y_test, y_pred_t, zero_division=0)
        precision = precision_score(y_test, y_pred_t, zero_division=0)
        f1 = f1_score(y_test, y_pred_t, zero_division=0)
        
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred_t).ravel()
        
        thresholds_analysis.append({
            'threshold': threshold,
            'recall': recall,
            'precision': precision,
            'f1': f1,
            'missed': int(fn),
            'false_alarms': int(fp),
            'tp': int(tp),
            'tn': int(tn)
        })
        
        print(f"  Threshold {threshold:.2f}: Recall={recall:.1%}, Precision={precision:.1%}, Missed={fn}, FA={fp}")
    
    return thresholds_analysis

# ============================================================================
# FEATURE IMPORTANCE
# ============================================================================

def get_feature_importance(model, feature_names, model_name):
    """Extract feature importance"""
    if 'CatBoost' in model_name:
        importance = model.get_feature_importance()
    elif hasattr(model, 'feature_importances_'):
        importance = model.feature_importances_
    else:
        return None
    
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importance,
        'pct': importance / importance.sum() * 100
    }).sort_values('importance', ascending=False)
    
    return importance_df

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("\n" + "=" * 70)
    print("COMPREHENSIVE EARLY WARNING MODEL TRAINING")
    print("All Features | Base vs Advanced Models | CatBoost Optimized")
    print("=" * 70)
    
    # Build dataset
    df = build_comprehensive_dataset()
    
    # Data quality check
    df = data_quality_check(df)
    
    # Define features
    target = 'at_risk'
    
    # Categorical features (CatBoost will handle these natively)
    cat_features = [
        'nivel_educativo',
        'age_grade_status',
        'indice_accesibilidad',
        'genero',
        'grupo_socioeconomico',
        'tipo_vivienda',
        'material_paredes',
        'material_piso',
        'tipo_sanitario',
        'relacion',
        'estado_civil',
        'ocupacion_jefe'
    ]
    
    # All feature columns
    feature_cols = [col for col in df.columns if col != target]
    
    print(f"\n📊 FEATURE SUMMARY:")
    print(f"   Total features: {len(feature_cols)}")
    print(f"   Categorical: {len(cat_features)}")
    print(f"   Numeric: {len(feature_cols) - len(cat_features)}")
    
    # Prepare data
    X = df[feature_cols]
    y = df[target]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 DATA SPLIT:")
    print(f"   Training: {len(X_train)} students ({y_train.mean()*100:.1f}% at-risk)")
    print(f"   Testing: {len(X_test)} students ({y_test.mean()*100:.1f}% at-risk)")
    
    # Train and compare models
    results, (best_name, best_model, best_X_test) = train_and_compare_models(
        X_train, X_test, y_train, y_test, cat_features, feature_cols
    )
    
    print(f"\n🏆 BEST MODEL: {best_name}")
    
    # Threshold optimization (use appropriate X_test data)
    thresholds = optimize_thresholds(best_model, best_X_test, y_test)
    
    # Feature importance
    print("\n" + "=" * 70)
    print("TOP 25 FEATURE IMPORTANCE")
    print("=" * 70)
    
    importance_df = get_feature_importance(best_model, feature_cols, best_name)
    if importance_df is not None:
        print(importance_df.head(25).to_string(index=False))
    
    # ========================================================================
    # SAVE OUTPUTS
    # ========================================================================
    print("\n" + "=" * 70)
    print("SAVING OUTPUTS")
    print("=" * 70)
    
    # Save best model
    if 'CatBoost' in best_name:
        model_path = os.path.join(OUTPUT_DIR, 'best_model.cbm')
        best_model.save_model(model_path)
    else:
        model_path = os.path.join(OUTPUT_DIR, 'best_model.joblib')
        joblib.dump(best_model, model_path)
    print(f"✓ Model saved: {model_path}")
    
    # Save feature importance
    if importance_df is not None:
        importance_path = os.path.join(OUTPUT_DIR, 'feature_importance.csv')
        importance_df.to_csv(importance_path, index=False)
        print(f"✓ Feature importance saved: {importance_path}")
    
    # Save model comparison
    results_df = pd.DataFrame(results)
    results_path = os.path.join(OUTPUT_DIR, 'model_comparison_results.csv')
    results_df.to_csv(results_path, index=False)
    print(f"✓ Model comparison saved: {results_path}")
    
    # Save comprehensive report
    best_result = [r for r in results if r['model'] == best_name][0]
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'experiment': 'Comprehensive Model with ALL Features',
        'dataset': {
            'total_students': len(df),
            'at_risk_count': int(y.sum()),
            'at_risk_percentage': float(y.mean() * 100),
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
            'roc_auc': best_result['roc_auc'],
            'recall': best_result['recall'],
            'precision': best_result['precision'],
            'f1': best_result['f1'],
            'cv_mean': best_result['cv_mean'],
            'cv_std': best_result['cv_std'],
            'missed_at_risk': best_result['missed_at_risk'],
            'false_alarms': best_result['false_alarms']
        },
        'all_models': results,
        'threshold_optimization': thresholds,
        'top_features': importance_df.head(20).to_dict('records') if importance_df is not None else []
    }
    
    report_path = os.path.join(OUTPUT_DIR, 'comprehensive_model_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"✓ Report saved: {report_path}")
    
    # ========================================================================
    # FINAL SUMMARY
    # ========================================================================
    print("\n" + "=" * 70)
    print("FINAL SUMMARY")
    print("=" * 70)
    
    print(f"\n📊 Dataset: {len(df)} students, {len(feature_cols)} features")
    print(f"   At-risk rate: {y.mean()*100:.1f}%")
    
    print(f"\n🏆 Best Model: {best_name}")
    print(f"   ROC-AUC: {best_result['roc_auc']:.3f}")
    print(f"   Recall: {best_result['recall']:.1%}")
    print(f"   Precision: {best_result['precision']:.1%}")
    print(f"   CV Score: {best_result['cv_mean']:.3f} ± {best_result['cv_std']:.3f}")
    
    # Find best threshold for 90%+ recall
    high_recall_threshold = None
    for t in thresholds:
        if t['recall'] >= 0.90:
            high_recall_threshold = t
            break
    
    if high_recall_threshold:
        print(f"\n🎯 Recommended Threshold: {high_recall_threshold['threshold']}")
        print(f"   Recall: {high_recall_threshold['recall']:.1%}")
        print(f"   Missed students: {high_recall_threshold['missed']}")
        print(f"   False alarms: {high_recall_threshold['false_alarms']}")
    
    print(f"\n📁 Outputs saved to: {OUTPUT_DIR}")
    print("\n✅ Comprehensive model training complete!")

if __name__ == "__main__":
    main()
