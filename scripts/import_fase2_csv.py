"""
Script optimizado para importar dataset_fase2_con_indices_completos.csv a Supabase
687 estudiantes con 99 columnas

Uso:
    python import_fase2_csv.py
"""

import pandas as pd
import os
import logging
from dotenv import load_dotenv
from supabase import create_client

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

def connect_to_supabase():
    """Conectar a Supabase usando SERVICE_KEY"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError("❌ SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar en .env")

    logger.info(f"✓ Conectando a Supabase: {url}")
    return create_client(url, key)


def load_csv_data(csv_path):
    """Cargar datos del CSV"""
    logger.info(f"📁 Cargando {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"✓ Cargados {len(df)} estudiantes con {len(df.columns)} columnas")
        return df
    except Exception as e:
        logger.error(f"❌ Error al cargar CSV: {str(e)}")
        raise


def prepare_students_table(df):
    """Preparar datos para tabla students"""
    logger.info("📋 Preparando datos de estudiantes...")
    
    students = []
    for _, row in df.iterrows():
        # Generar ID formateado
        student_id = f"EST{str(row['ID']).zfill(3)}"
        
        # Construir nombre completo
        nombre = str(row.get('Nombres', '')).strip() if pd.notna(row.get('Nombres')) else ''
        apellido = str(row.get('Apellidos', '')).strip() if pd.notna(row.get('Apellidos')) else ''
        nombre_completo = f"{nombre} {apellido}".strip()
        
        student = {
            "id": student_id,
            "nombre": nombre_completo,
            "grado": str(row.get('Grado', '')).strip() if pd.notna(row.get('Grado')) else None,
            "seccion": "A",  # Default, ajustar si tienes la columna
            "edad": int(row['Edad']) if pd.notna(row.get('Edad')) else None,
            "genero": None,  # No está en el CSV
            "quintil": int(row['Quintil']) if pd.notna(row.get('Quintil')) else None,
            "quintil_agrupado": _clasificar_quintil(row.get('Quintil')),
            "promedio_general": float(row['Promedio_General']) if pd.notna(row.get('Promedio_General')) else None,
        }
        students.append(student)
    
    logger.info(f"✓ Preparados {len(students)} registros para tabla students")
    return students


def _clasificar_quintil(quintil):
    """Clasificar quintil en grupos Bajo/Medio/Alto/Acomodado"""
    if pd.isna(quintil):
        return None
    
    quintil = int(quintil)
    if quintil <= 2:
        return "Bajo"
    elif quintil == 3:
        return "Medio"
    elif quintil == 4:
        return "Alto"
    else:  # quintil == 5
        return "Acomodado"


def prepare_socioeconomic_table(df):
    """Preparar datos para tabla socioeconomic_data"""
    logger.info("📋 Preparando datos socioeconómicos...")
    
    socioeconomic = []
    for _, row in df.iterrows():
        student_id = f"EST{str(row['ID']).zfill(3)}"
        
        data = {
            "student_id": student_id,
            "nivel_instruccion_rep": str(row.get('Nivel Instruccion', '')).strip() if pd.notna(row.get('Nivel Instruccion')) else None,
            "edad_representante": int(row['Edad_rep']) if pd.notna(row.get('Edad_rep')) else None,
            "relacion": str(row.get('Relacion', '')).strip() if pd.notna(row.get('Relacion')) else None,
            "estado_civil": str(row.get('Estado civil', '')).strip() if pd.notna(row.get('Estado civil')) else None,
            "laptop": _parse_si_no(row.get('Laptop')),
            "internet": _parse_si_no(row.get('Internet')),
            "computadora": _parse_si_no(row.get('Computadora')),
            "lectura_libros": _parse_si_no(row.get('Lectura_libros')),
            "numero_hermanos": 0,  # No disponible en CSV
            "tipo_vivienda": str(row.get('Tipo vivienda', '')).strip() if pd.notna(row.get('Tipo vivienda')) else None,
            # Índices calculados - se dejan en NULL y se calcularán en el backend cuando se necesiten
            # "indice_cobertura_salud": None,
            # "indice_acceso_tecnologico": None,  
            # "indice_apoyo_familiar": None,
            # "indice_accesibilidad_geografica": None,
        }
        socioeconomic.append(data)
    
    logger.info(f"✓ Preparados {len(socioeconomic)} registros para tabla socioeconomic_data")
    return socioeconomic


def _parse_si_no(value):
    """Convertir 'Si'/'No' a booleano"""
    if pd.isna(value):
        return None
    value_str = str(value).strip().lower()
    return value_str in ['si', 'sí', 'yes', 'true', '1']


def prepare_attendance_table(df):
    """Preparar datos para tabla attendance"""
    logger.info("📋 Preparando datos de asistencia...")
    
    attendance = []
    for _, row in df.iterrows():
        student_id = f"EST{str(row['ID']).zfill(3)}"
        
        data = {
            "student_id": student_id,
            "mes": "Octubre",
            "year": 2025,
            "total_inasistencias": int(row['Total_Inasistencias_Oct']) if pd.notna(row.get('Total_Inasistencias_Oct')) else 0,
            "faltas_justificadas": int(row['Faltas_Justificadas_Oct']) if pd.notna(row.get('Faltas_Justificadas_Oct')) else 0,
            "faltas_injustificadas": int(row['Faltas_Injustificadas_Oct']) if pd.notna(row.get('Faltas_Injustificadas_Oct')) else 0,
            "atrasos": int(row['Total_Atrasos_Oct']) if pd.notna(row.get('Total_Atrasos_Oct')) else 0,
        }
        attendance.append(data)
    
    logger.info(f"✓ Preparados {len(attendance)} registros para tabla attendance")
    return attendance


def prepare_academic_performance_table(df):
    """Preparar datos para tabla academic_performance (notas por materia)"""
    logger.info("📋 Preparando datos de rendimiento académico...")
    
    # Identificar columnas de materias (terminan en _Oct)
    materia_columns = [col for col in df.columns if col.endswith('_Oct') and col not in [
        'Faltas_Justificadas_Oct', 'Faltas_Injustificadas_Oct', 
        'Atrasos_Injustificados_Oct', 'Atrasos_Justificados_Oct',
        'Total_Faltas_Oct', 'Total_Atrasos_Oct', 'Total_Inasistencias_Oct'
    ]]
    
    logger.info(f"  Materias encontradas: {len(materia_columns)}")
    
    academic = []
    for _, row in df.iterrows():
        student_id = f"EST{str(row['ID']).zfill(3)}"
        
        for materia_col in materia_columns:
            nota = row.get(materia_col)
            
            if pd.notna(nota):
                # Limpiar nombre de materia
                materia_nombre = materia_col.replace('_Oct', '').replace('_', ' ').strip()
                
                data = {
                    "student_id": student_id,
                    "materia": materia_nombre,
                    "nota": float(nota),
                    "year": 2025,
                    "periodo": "Q2",  # Octubre corresponde al segundo quimestre
                }
                academic.append(data)
    
    logger.info(f"✓ Preparados {len(academic)} registros para tabla academic_performance")
    return academic


def insert_data(supabase_client, table_name, data, batch_size=100):
    """Insertar datos en Supabase por lotes"""
    logger.info(f"📤 Insertando {len(data)} registros en tabla '{table_name}'...")
    
    if not data:
        logger.warning(f"⚠️  No hay datos para insertar en {table_name}")
        return
    
    total_inserted = 0
    errors = 0
    
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        
        try:
            response = supabase_client.table(table_name).insert(batch).execute()
            total_inserted += len(batch)
            logger.info(f"  ✓ {total_inserted}/{len(data)} registros insertados")
        except Exception as e:
            errors += 1
            logger.error(f"  ✗ Error en lote {i}-{i+batch_size}: {str(e)}")
            
            # Intentar insertar uno por uno en caso de error
            if errors <= 3:  # Solo intentar con los primeros 3 lotes con error
                logger.info(f"  🔄 Intentando inserción individual...")
                for item in batch:
                    try:
                        supabase_client.table(table_name).insert(item).execute()
                        total_inserted += 1
                    except Exception as e2:
                        logger.error(f"    ✗ Error en registro: {e2}")
    
    logger.info(f"✅ Total insertado en '{table_name}': {total_inserted}/{len(data)} registros")
    if errors > 0:
        logger.warning(f"⚠️  {errors} lotes con errores")


def main():
    """Función principal"""
    try:
        print("\n" + "="*70)
        print("🚀 IMPORTACIÓN DE DATOS FASE 2 A SUPABASE")
        print("="*70 + "\n")
        
        # 1. Conectar a Supabase
        supabase = connect_to_supabase()
        
        # 2. Cargar CSV
        csv_path = "dataset_fase2_con_indices_completos.csv"
        df = load_csv_data(csv_path)
        
        # 3. Preparar datos para cada tabla
        print("\n" + "="*70)
        print("PREPARANDO DATOS PARA IMPORTACIÓN")
        print("="*70 + "\n")
        
        students_data = prepare_students_table(df)
        socioeconomic_data = prepare_socioeconomic_table(df)
        attendance_data = prepare_attendance_table(df)
        academic_data = prepare_academic_performance_table(df)
        
        # 4. Mostrar resumen
        print("\n" + "="*70)
        print("RESUMEN DE DATOS A IMPORTAR")
        print("="*70)
        print(f"  📊 students:               {len(students_data):4d} registros")
        print(f"  📊 socioeconomic_data:     {len(socioeconomic_data):4d} registros")
        print(f"  📊 attendance:             {len(attendance_data):4d} registros")
        print(f"  📊 academic_performance:   {len(academic_data):4d} registros")
        print(f"  📊 TOTAL:                  {len(students_data) + len(socioeconomic_data) + len(attendance_data) + len(academic_data):4d} registros")
        
        # 5. Confirmar antes de importar
        print("\n" + "="*70)
        respuesta = input("¿Proceder con la importación? (si/no): ").strip().lower()
        
        if respuesta not in ['si', 'sí', 's', 'yes', 'y']:
            logger.info("❌ Importación cancelada por el usuario")
            return
        
        # 6. Insertar datos en orden correcto (respetando foreign keys)
        print("\n" + "="*70)
        print("IMPORTANDO DATOS A SUPABASE")
        print("="*70 + "\n")
        
        insert_data(supabase, "students", students_data)
        insert_data(supabase, "socioeconomic_data", socioeconomic_data)
        insert_data(supabase, "attendance", attendance_data)
        insert_data(supabase, "academic_performance", academic_data)
        
        print("\n" + "="*70)
        print("✅ ¡IMPORTACIÓN COMPLETADA EXITOSAMENTE!")
        print("="*70)
        print("\n📝 Próximos pasos:")
        print("  1. Verificar datos en Supabase Table Editor")
        print("  2. Descomentar código de Supabase en backend/services/supabase_client.py")
        print("  3. Reiniciar backend: python app.py")
        print("  4. Probar endpoints: curl http://localhost:5000/api/sat-list")
        print("\n")
        
    except Exception as e:
        logger.error(f"❌ Error en la importación: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
