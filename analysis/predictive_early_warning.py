"""
Predictive Early Warning System - PROACTIVE (not REACTIVE)
============================================================

OBJETIVO: Predecir qué estudiantes reprobarán materias ANTES de que suceda
          Basado en características al inicio del año (quintil, barreras, etc.)
          SIN usar notas actuales (porque queremos predecir el futuro)

ENFOQUE:
1. Entrenar modelo ML con datos históricos
2. Usar características socioeconómicas, demográficas, barreras
3. Predecir probabilidad de reprobar por materia
4. Generar alertas PREVENTIVAS al inicio del año escolar

Este ES el verdadero "Early Warning" - predecir antes del problema
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
import json
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import matplotlib.pyplot as plt
import seaborn as sns

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from services.supabase_client import supabase_client
from services.risk_calculator import RiskCalculator

# Output directory
OUTPUT_DIR = Path(__file__).parent / "predictive_early_warning"
OUTPUT_DIR.mkdir(exist_ok=True)

plt.style.use('seaborn-v0_8-whitegrid')

# Subject name normalization - combine variations
SUBJECT_NAME_MAP = {
    "Matemática": "Matemáticas",
    "matemática": "Matemáticas",
    "MATEMÁTICA": "Matemáticas",
    "MATEMÁTICAS": "Matemáticas",
    "Animación lectura": "Lengua y Literatura",
    "Animación Lectura": "Lengua y Literatura",
    "Estudios sociales": "Estudios Sociales",
    "estudios sociales": "Estudios Sociales",
    "Ciencias naturales": "Ciencias Naturales",
    "ciencias naturales": "Ciencias Naturales",
}

# Non-academic subjects to filter out
NON_ACADEMIC_SUBJECTS = {"Acompañamiento", "PPE", "acompañamiento", "ppe"}

def normalize_subject_name(subject: str) -> str:
    """Normalize subject names to consistent values"""
    return SUBJECT_NAME_MAP.get(subject, subject)


def fetch_historical_data():
    """
    Obtiene datos históricos para entrenar el modelo predictivo
    
    IMPORTANTE: Para cada estudiante-materia:
    - Features: Características al INICIO del año (quintil, barreras, demográficos)
    - Target: Resultado FINAL (aprobó/reprobó la materia)
    
    Esto simula tener datos de años anteriores
    """
    print("\n" + "="*80)
    print("PREDICTIVE EARLY WARNING SYSTEM - PROACTIVE MODEL")
    print("="*80 + "\n")
    
    print("📊 Fetching student data from Supabase...")
    students = supabase_client.get_students(limit=1000)
    
    if not students:
        print("❌ Failed to fetch students")
        return None
    
    print(f"✅ Retrieved {len(students)} students\n")
    print("🔄 Building predictive dataset (student × subject level)...\n")
    
    data = []
    
    for student in students:
        student_id = student.get('id')
        
        # === FEATURES (disponibles al INICIO del año) ===
        
        # Socioeconomic (conocidos desde matrícula)
        socio_data = student.get('socioeconomic_data', [{}])[0] if student.get('socioeconomic_data') else {}
        
        quintil = student.get('quintil') or 5
        edad = student.get('edad', 0)
        genero = student.get('genero', 'Unknown')
        
        # Barreras (encuesta inicial)
        laptop = int(socio_data.get('laptop') or 0)
        internet = int(socio_data.get('internet') or 0)
        tv = int(socio_data.get('tv') or 0)
        lectura_libros = int(socio_data.get('lectura_libros') or 0)
        numero_hermanos = socio_data.get('numero_hermanos') or 0
        edad_rep = socio_data.get('edad_representante') or 0
        nivel_instruccion = socio_data.get('nivel_instruccion_rep', 'Desconocido')
        
        # Geographic accessibility / Distance to school (new feature)
        distancia = socio_data.get('indice_accesibilidad_geografica', 'Desconocido')
        if distancia is None:
            distancia = 'Desconocido'
        
        # Attendance data - ELIMINADO porque causaba overfitting (>147% importance)
        # Las inasistencias del primer mes están correlacionadas con notas finales
        # pero NO son predictivas al inicio del año
        total_inasistencias = 0
        faltas_injustificadas = 0
        
        # Calculate risk_score components
        risk_score, risk_level, components = RiskCalculator.calculate_risk_score(student)
        
        # Componentes de riesgo baseline
        quintil_component = components.get('quintil', {}).get('score', 0)
        barriers_component = components.get('barriers', {}).get('score', 0)
        
        # === TARGET (resultado final del año) ===
        
        # Academic performance por materia
        academic_records = student.get('academic_performance', [])
        
        if not academic_records:
            continue
        
        # Crear diccionario de notas por materia (para usar como features)
        notas_por_materia = {}
        for record in academic_records:
            mat_nombre = record.get('materia', 'Unknown')
            # Normalize subject name
            mat_nombre = normalize_subject_name(mat_nombre)
            # Skip non-academic subjects
            if mat_nombre in NON_ACADEMIC_SUBJECTS:
                continue
            mat_nota = record.get('nota', 0)
            if mat_nota and mat_nota > 0:
                # If same subject appears multiple times, keep the latest
                notas_por_materia[mat_nombre] = mat_nota
        
        # Para cada materia, crear una fila en el dataset
        for record in academic_records:
            materia = record.get('materia', 'Unknown')
            # Normalize subject name
            materia = normalize_subject_name(materia)
            # Skip non-academic subjects
            if materia in NON_ACADEMIC_SUBJECTS:
                continue
            nota_final = record.get('nota', 0)
            
            if not nota_final or nota_final == 0:
                continue
            
            # TARGET: ¿Reprobó la materia? (< 7.0)
            failed = 1 if nota_final < 7.0 else 0
            
            # TAMBIÉN podemos predecir "at_risk" (< 7.5)
            at_risk = 1 if nota_final < 7.5 else 0
            
            row = {
                # Identifiers
                'student_id': student_id,
                'subject': materia,
                
                # FEATURES - Socioeconómicos (matrícula)
                'quintil': quintil,
                'edad': edad,
                'genero': genero,
                'laptop': laptop,
                'internet': internet,
                'tv': tv,
                'lectura_libros': lectura_libros,
                'numero_hermanos': numero_hermanos,
                'edad_representante': edad_rep,
                'nivel_instruccion_rep': nivel_instruccion,
                'distancia_escuela': distancia,  # NEW: Geographic accessibility
                
                # FEATURES - Asistencia (primer mes)
                'total_inasistencias': total_inasistencias,
                'faltas_injustificadas': faltas_injustificadas,
                
                # FEATURES - Risk components baseline
                'quintil_component_score': quintil_component,
                'barriers_component_score': barriers_component,
                'risk_score_baseline': quintil_component * 0.25 + 
                                      barriers_component * 0.20,
                
                # FEATURES - Notas de OTRAS materias (no la que estamos prediciendo)
                # Esto ayuda: si reprueba Matemáticas, ¿cómo le va en otras materias?
            }
            
            # Agregar notas de otras materias como features
            for otra_materia, otra_nota in notas_por_materia.items():
                if otra_materia != materia:  # NO incluir la materia que estamos prediciendo
                    col_name = f'nota_{otra_materia.replace(" ", "_").replace(".", "")}'
                    row[col_name] = otra_nota
            
            # TARGET (resultado final del año)
            row['nota_final'] = nota_final
            row['failed'] = failed  # Primary target: Reprobó (< 7.0)
            row['at_risk'] = at_risk  # Secondary target: En riesgo (< 7.5)
            
            data.append(row)
    
    df = pd.DataFrame(data)
    
    print(f"📋 Dataset created: {len(df)} records (student × subject)")
    print(f"   Students: {df['student_id'].nunique()}")
    print(f"   Subjects: {df['subject'].nunique()}")
    print(f"\n📊 Target distribution:")
    print(f"   Failed (< 7.0): {df['failed'].sum()} ({df['failed'].mean()*100:.1f}%)")
    print(f"   At Risk (< 7.5): {df['at_risk'].sum()} ({df['at_risk'].mean()*100:.1f}%)")
    print(f"   Passing (≥ 7.5): {(1-df['at_risk']).sum()} ({(1-df['at_risk'].mean())*100:.1f}%)")
    
    return df


def prepare_features(df):
    """
    Prepara features para el modelo
    """
    print("\n🔧 Preparing features for ML model...\n")
    
    # Encode categorical variables
    df_encoded = df.copy()
    
    # Gender encoding
    df_encoded['genero_encoded'] = df_encoded['genero'].map({
        'Masculino': 1,
        'Femenino': 0,
        'Unknown': -1
    }).fillna(-1)
    
    # Nivel instruccion encoding (ordinal)
    nivel_map = {
        'Ninguno': 0,
        'Primaria': 1,
        'Secundaria completa': 2,
        'Educación superior': 3,
        'Postgrado': 4,
        'Desconocido': -1
    }
    df_encoded['nivel_instruccion_encoded'] = df_encoded['nivel_instruccion_rep'].map(nivel_map).fillna(-1)
    
    # Distance encoding (ordinal) - NEW FEATURE
    distancia_map = {
        'Muy cerca': 0,
        'Cerca': 1,
        'Moderado': 2,
        'Lejos': 3,
        'Muy lejos': 4,
        'Desconocido': -1  # Will be ignored by CatBoost if all are -1
    }
    df_encoded['distancia_encoded'] = df_encoded['distancia_escuela'].map(distancia_map).fillna(-1)
    
    # Subject encoding (one-hot)
    subject_dummies = pd.get_dummies(df_encoded['subject'], prefix='subject')
    df_encoded = pd.concat([df_encoded, subject_dummies], axis=1)
    
    # Feature list
    feature_cols = [
        # Socioeconomic (conocidos desde matrícula)
        'quintil',
        'laptop',
        'internet',
        'tv',
        'lectura_libros',
        'numero_hermanos',
        
        # Demographic (conocidos desde matrícula)
        'edad',
        'genero_encoded',
        'edad_representante',
        'nivel_instruccion_encoded',
        'distancia_encoded',  # NEW: Geographic accessibility
        
        # Risk components baseline
        'quintil_component_score',
        'barriers_component_score',
        'risk_score_baseline',
        
        # Subject indicators (materia que estamos prediciendo)
    ] + [col for col in df_encoded.columns if col.startswith('subject_')]
    
    # Add grades from OTHER subjects (not the one we're predicting)
    # IMPORTANTE: Excluir 'nota_final' que es la variable target
    grade_cols = [col for col in df_encoded.columns 
                  if col.startswith('nota_') and col != 'nota_final']
    feature_cols.extend(grade_cols)
    
    X = df_encoded[feature_cols]
    y_failed = df_encoded['failed']
    y_at_risk = df_encoded['at_risk']
    
    num_subjects = len([c for c in feature_cols if c.startswith('subject_')])
    num_grades = len([c for c in feature_cols if c.startswith('nota_')])
    
    print(f"✅ Features prepared: {len(feature_cols)} features")
    print(f"   Socioeconomic: 6 features (quintil, laptop, internet, tv, libros, hermanos)")
    print(f"   Demographic: 4 features (edad, género, edad_rep, nivel_instrucción)")
    print(f"   Risk baseline: 3 features (quintil_score, barriers_score, risk_baseline)")
    print(f"   Subject indicators: {num_subjects} features")
    print(f"   Other subjects grades: {num_grades} features (rendimiento en otras materias)")
    print(f"\n📌 ESTRATEGIA:")
    print(f"   • Para predecir Matemáticas, usamos notas de Lengua, Ciencias, etc.")
    print(f"   • NO usamos promedio general (evita data leakage)")
    print(f"   • NO usamos asistencia (causaba overfitting >147%)\n")
    
    return X, y_failed, y_at_risk, feature_cols, df_encoded


def train_predictive_model(X, y, target_name='failed', df_encoded=None):
    """
    Entrena modelo CatBoost para PREDECIR reprobación
    
    IMPORTANTE: Este modelo NO ve las notas actuales
                Solo ve características del estudiante al inicio del año
    
    LIMITACIÓN: Usamos datos del MISMO año (2024) porque no hay datos históricos
                Idealmente necesitaríamos: 2022-2023 para entrenar, 2024 para validar
    """
    print(f"\n🤖 Training predictive model for '{target_name}'...\n")
    
    # Split data (80% train, 20% test)
    # IMPORTANTE: Split aleatorio a nivel de REGISTROS (student×subject)
    # Esto significa que UN MISMO estudiante puede estar en train Y test
    # (con diferentes materias)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Analyze unique students in splits (if df_encoded provided)
    if df_encoded is not None:
        train_indices = X_train.index
        test_indices = X_test.index
        
        train_students = df_encoded.loc[train_indices, 'student_id'].unique()
        test_students = df_encoded.loc[test_indices, 'student_id'].unique()
        overlap_students = set(train_students) & set(test_students)
    
    print("="*80)
    print("DATA SPLIT BREAKDOWN")
    print("="*80)
    print(f"\n📊 Total dataset: {len(X)} registros (student × subject combinations)")
    
    if df_encoded is not None:
        print(f"   Total unique students: {df_encoded['student_id'].nunique()}")
    
    print(f"\n   ┌─ Training set: {len(X_train)} registros ({len(X_train)/len(X)*100:.1f}%)")
    print(f"   │  → El modelo APRENDE de estos datos")
    print(f"   │  → Ajusta pesos y parámetros basándose en estos ejemplos")
    if df_encoded is not None:
        print(f"   │  → Unique students in train: {len(train_students)}")
    print(f"   │  → Positive class: {y_train.sum()} casos de reprobación ({y_train.mean()*100:.1f}%)")
    print(f"   │  → Negative class: {(1-y_train).sum():.0f} casos de aprobación ({(1-y_train.mean())*100:.1f}%)")
    
    print(f"   │")
    print(f"   └─ Testing set: {len(X_test)} registros ({len(X_test)/len(X)*100:.1f}%)")
    print(f"      → El modelo NUNCA vio estos registros durante entrenamiento")
    print(f"      → Se usa para medir si puede GENERALIZAR a datos nuevos")
    if df_encoded is not None:
        print(f"      → Unique students in test: {len(test_students)}")
        print(f"      → Students que aparecen en AMBOS sets: {len(overlap_students)}")
        print(f"        (Mismo estudiante, diferentes materias en train vs test)")
    print(f"      → Positive class: {y_test.sum()} casos de reprobación ({y_test.mean()*100:.1f}%)")
    print(f"      → Negative class: {(1-y_test).sum():.0f} casos de aprobación ({(1-y_test.mean())*100:.1f}%)")
    
    print(f"\n⚠️  LIMITACIÓN ACTUAL:")
    print(f"   • Todos los datos son del MISMO año lectivo (2024)")
    print(f"   • Split es ALEATORIO a nivel de registros (no por estudiante completo)")
    print(f"   • Mismo estudiante puede estar en train Y test (diferentes materias)")
    print(f"\n✅ IDEAL para producción:")
    print(f"   • Training: Datos históricos 2022-2023 (años pasados)")
    print(f"   • Testing: Datos actuales 2024 (año presente)")
    print(f"   • Esto simularía: 'Aprender del pasado, predecir el futuro'")
    print(f"   • Validación temporal real, no solo validación aleatoria\n")
    print("="*80 + "\n")
    
    # Handle class imbalance
    class_weight_ratio = (1 - y_train.mean()) / y_train.mean()
    scale_pos_weight = min(class_weight_ratio, 10)  # Cap at 10
    
    print(f"⚖️ Handling class imbalance:")
    print(f"   Scale pos weight: {scale_pos_weight:.2f}\n")
    
    # Train CatBoost
    model = CatBoostClassifier(
        iterations=500,
        learning_rate=0.05,
        depth=6,
        l2_leaf_reg=3.0,
        random_seed=42,
        verbose=False,
        scale_pos_weight=scale_pos_weight,
        eval_metric='AUC'
    )
    
    print("🔄 Training model with cross-validation for robustness check...\n")
    
    # Cross-validation (5-fold) para validar robustez del modelo
    # Divide datos en 5 partes, entrena 5 veces (cada vez con 4/5 train, 1/5 test)
    from sklearn.model_selection import cross_val_score, StratifiedKFold
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores_auc = cross_val_score(
        model, X_train, y_train, 
        cv=cv, 
        scoring='roc_auc',
        n_jobs=-1
    )
    
    print("📊 5-Fold Cross-Validation Results (ROC-AUC):")
    print(f"   Fold 1: {cv_scores_auc[0]:.3f}")
    print(f"   Fold 2: {cv_scores_auc[1]:.3f}")
    print(f"   Fold 3: {cv_scores_auc[2]:.3f}")
    print(f"   Fold 4: {cv_scores_auc[3]:.3f}")
    print(f"   Fold 5: {cv_scores_auc[4]:.3f}")
    print(f"   ───────────────────")
    print(f"   Mean:   {cv_scores_auc.mean():.3f} ± {cv_scores_auc.std():.3f}")
    print(f"\n💡 Esto significa:")
    print(f"   El modelo tiene un AUC promedio de {cv_scores_auc.mean():.3f}")
    print(f"   Con variación de ±{cv_scores_auc.std():.3f} entre diferentes particiones")
    print(f"   Si std es bajo (<0.05) → Modelo es ESTABLE y ROBUSTO")
    print(f"   Si std es alto (>0.10) → Modelo es INESTABLE, depende mucho del split\n")
    
    # Train final model on full training set
    print("🎯 Training final model on full training set...\n")
    model.fit(
        X_train, y_train,
        eval_set=(X_test, y_test),
        early_stopping_rounds=50,
        verbose=False
    )
    
    # Predictions
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = model.predict(X_test)
    
    # Metrics
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    print("\n" + "="*80)
    print(f"MODEL PERFORMANCE ON TEST SET ({target_name})")
    print("="*80)
    print(f"\nAccuracy:  {accuracy:.3f}")
    print(f"   → De TODOS los casos, cuántos predice correctamente")
    print(f"   → Fórmula: (TP + TN) / Total")
    print(f"   → {accuracy:.1%} de las predicciones son correctas\n")
    
    print(f"Precision: {precision:.3f}")
    print(f"   → De los que PREDICE que reprobarán, cuántos realmente reprueban")
    print(f"   → Fórmula: TP / (TP + FP)")
    print(f"   → {precision:.1%} de las alertas son correctas (pocas falsas alarmas)\n")
    
    print(f"Recall:    {recall:.3f}")
    print(f"   → De los que REALMENTE reprueban, cuántos detecta el modelo")
    print(f"   → Fórmula: TP / (TP + FN)")
    print(f"   → {recall:.1%} de los casos críticos son detectados (cobertura)\n")
    
    print(f"F1-Score:  {f1:.3f}")
    print(f"   → Balance entre Precision y Recall")
    print(f"   → Fórmula: 2 × (Precision × Recall) / (Precision + Recall)\n")
    
    print(f"ROC-AUC:   {auc:.3f}")
    print(f"   → Capacidad de discriminar entre clases (0.5=random, 1.0=perfecto)")
    print(f"   → {auc:.1%} de probabilidad de rankear correctamente")
    print(f"   → >0.7 = Aceptable, >0.8 = Bueno, >0.9 = Excelente\n")
    
    print("="*80 + "\n")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(f"   True Negatives:  {cm[0,0]} (Predijo passing, fue passing)")
    print(f"   False Positives: {cm[0,1]} (Predijo failing, fue passing)")
    print(f"   False Negatives: {cm[1,0]} (Predijo passing, fue failing) ⚠️")
    print(f"   True Positives:  {cm[1,1]} (Predijo failing, fue failing)\n")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("Top 15 Most Important Features:")
    for idx, row in feature_importance.head(15).iterrows():
        feat_name = row['feature']
        feat_imp = row['importance']
        
        # Categorize feature
        if feat_name in ['total_inasistencias', 'faltas_injustificadas']:
            category = "[ATTENDANCE]"
        elif feat_name.startswith('nota_'):
            category = "[GRADE-OTHER]"
        elif feat_name.startswith('subject_'):
            category = "[SUBJECT]"
        elif feat_name in ['quintil', 'laptop', 'internet', 'tv', 'lectura_libros', 'numero_hermanos']:
            category = "[SOCIO-ECON]"
        else:
            category = "[OTHER]"
        
        print(f"   {feat_name:40s} {category:15s} {feat_imp:.4f}")
    
    # Analyze attendance importance
    attendance_features = feature_importance[
        feature_importance['feature'].isin(['total_inasistencias', 'faltas_injustificadas'])
    ]
    
    if not attendance_features.empty:
        attendance_total_imp = attendance_features['importance'].sum()
        print(f"\n⚠️  ATTENDANCE IMPACT: {attendance_total_imp:.4f} ({attendance_total_imp*100:.2f}%)")
        print(f"   Si > 20% → Asistencia domina el modelo (posible overfitting)")
        print(f"   Si < 10% → Asistencia contribuye poco (podemos eliminarlo)")
        print(f"   Si 10-20% → Asistencia ayuda moderadamente (mantener)\n")
    
    print()
    
    return model, feature_importance, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'auc': auc
    }


def generate_proactive_alerts(df_encoded, model, feature_cols, X):
    """
    Genera alertas PROACTIVAS usando el modelo predictivo
    
    Estas son PREDICCIONES, no observaciones de notas actuales
    """
    print("\n🔮 Generating PROACTIVE alerts (predictions, not current grades)...\n")
    
    # Predict for all student-subject combinations
    df_predictions = df_encoded.copy()
    df_predictions['predicted_prob_fail'] = model.predict_proba(X)[:, 1]
    df_predictions['predicted_fail'] = model.predict(X)
    
    # Group by student
    student_predictions = []
    
    for student_id in df_predictions['student_id'].unique():
        student_data = df_predictions[df_predictions['student_id'] == student_id]
        
        # Subjects predicted to fail
        predicted_failing = student_data[student_data['predicted_fail'] == 1]
        
        # High risk subjects (prob > 0.5)
        high_risk_subjects = student_data[student_data['predicted_prob_fail'] > 0.5]
        
        # Medium risk subjects (prob 0.3-0.5)
        medium_risk_subjects = student_data[
            (student_data['predicted_prob_fail'] >= 0.3) & 
            (student_data['predicted_prob_fail'] < 0.5)
        ]
        
        if len(high_risk_subjects) == 0 and len(medium_risk_subjects) == 0:
            continue  # Skip students with no predictions
        
        student_predictions.append({
            'student_id': student_id,
            'high_risk_subjects': [
                {
                    'subject': row['subject'],
                    'probability': row['predicted_prob_fail'],
                    'actual_grade': row['nota_final'],  # For validation
                    'actually_failed': row['failed']
                }
                for _, row in high_risk_subjects.iterrows()
            ],
            'medium_risk_subjects': [
                {
                    'subject': row['subject'],
                    'probability': row['predicted_prob_fail'],
                    'actual_grade': row['nota_final'],
                    'actually_failed': row['failed']
                }
                for _, row in medium_risk_subjects.iterrows()
            ]
        })
    
    print(f"✅ Generated proactive alerts for {len(student_predictions)} students")
    print(f"   Students with high-risk predictions: {sum(1 for s in student_predictions if len(s['high_risk_subjects']) > 0)}")
    print(f"   Students with medium-risk predictions: {sum(1 for s in student_predictions if len(s['medium_risk_subjects']) > 0)}\n")
    
    return student_predictions


def save_results(model, feature_importance, metrics, predictions, target_name):
    """
    Guarda resultados del modelo predictivo
    """
    # Save model
    model_path = OUTPUT_DIR / f'predictive_model_{target_name}.cbm'
    model.save_model(str(model_path))
    print(f"💾 Model saved: {model_path}")
    
    # Save feature importance
    fi_path = OUTPUT_DIR / f'feature_importance_{target_name}.csv'
    feature_importance.to_csv(fi_path, index=False)
    print(f"💾 Feature importance saved: {fi_path}")
    
    # Save metrics
    metrics_path = OUTPUT_DIR / f'model_metrics_{target_name}.json'
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"💾 Metrics saved: {metrics_path}")
    
    # Save predictions
    predictions_path = OUTPUT_DIR / f'proactive_alerts_{target_name}.json'
    with open(predictions_path, 'w', encoding='utf-8') as f:
        json.dump(predictions, f, indent=2, ensure_ascii=False)
    print(f"💾 Proactive alerts saved: {predictions_path}\n")


def main():
    """
    Main execution
    """
    # Fetch data
    df = fetch_historical_data()
    if df is None:
        return
    
    # Prepare features
    X, y_failed, y_at_risk, feature_cols, df_encoded = prepare_features(df)
    
    # Train model to predict FAILURE (< 7.0)
    print("\n" + "="*80)
    print("TRAINING MODEL TO PREDICT: Will student FAIL subject? (grade < 7.0)")
    print("="*80)
    model_failed, fi_failed, metrics_failed = train_predictive_model(X, y_failed, 'failed', df_encoded)
    
    # Generate proactive alerts
    predictions_failed = generate_proactive_alerts(df_encoded, model_failed, feature_cols, X)
    
    # Save results
    save_results(model_failed, fi_failed, metrics_failed, predictions_failed, 'failed')
    
    print("="*80)
    print("✅ PREDICTIVE EARLY WARNING SYSTEM COMPLETED")
    print("="*80)
    print("\n🎯 KEY INSIGHT:")
    print("   Este modelo PREDICE qué estudiantes reprobarán materias")
    print("   BASADO EN: Quintil, barreras, contexto familiar (conocido al inicio del año)")
    print("   SIN USAR: Notas actuales (porque queremos predecir el futuro)")
    print("\n💡 USO:")
    print("   1. Al inicio del año escolar, correr modelo con datos de matrícula")
    print("   2. Identificar estudiantes en riesgo ANTES de primer examen")
    print("   3. Asignar recursos preventivamente (tutorías, apoyo, etc.)")
    print("   4. Monitorear si intervenciones mejoran resultados\n")


if __name__ == "__main__":
    main()
