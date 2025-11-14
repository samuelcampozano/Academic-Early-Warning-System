"""
Script para importar datos desde Excel a Supabase
Basado en la estructura del dataset usado en la Fase 1 y Fase 2

Uso:
    python import_data_to_supabase.py --excel_path "ruta/al/archivo.xlsx"
"""

import pandas as pd
import argparse
from supabase import create_client
from dotenv import load_dotenv
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()


def connect_to_supabase():
    """Conectar a Supabase"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")  # Usar service key para permisos completos

    if not url or not key:
        raise ValueError("SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar en .env")

    return create_client(url, key)


def load_excel_data(excel_path):
    """
    Cargar datos desde el archivo Excel
    Estructura esperada: 5 hojas (Estudiantes, Representantes, Vivienda, Bienes, Económica)
    """
    logger.info(f"Cargando datos desde {excel_path}")

    try:
        # Leer todas las hojas
        estudiantes_df = pd.read_excel(excel_path, sheet_name=0)
        representantes_df = pd.read_excel(excel_path, sheet_name=1)
        vivienda_df = pd.read_excel(excel_path, sheet_name=2)
        bienes_df = pd.read_excel(excel_path, sheet_name=3)
        economica_df = pd.read_excel(excel_path, sheet_name=4)

        logger.info(f"✓ Cargadas {len(estudiantes_df)} filas de estudiantes")
        logger.info(f"✓ Cargadas {len(representantes_df)} filas de representantes")
        logger.info(f"✓ Cargadas {len(vivienda_df)} filas de vivienda")
        logger.info(f"✓ Cargadas {len(bienes_df)} filas de bienes")
        logger.info(f"✓ Cargadas {len(economica_df)} filas de economía")

        return {
            "estudiantes": estudiantes_df,
            "representantes": representantes_df,
            "vivienda": vivienda_df,
            "bienes": bienes_df,
            "economica": economica_df,
        }

    except Exception as e:
        logger.error(f"Error al cargar Excel: {str(e)}")
        raise


def merge_data(data_dict):
    """
    Merge de las 5 hojas en un dataframe consolidado
    """
    logger.info("Consolidando datos...")

    estudiantes_df = data_dict["estudiantes"]
    representantes_df = data_dict["representantes"]
    vivienda_df = data_dict["vivienda"]
    bienes_df = data_dict["bienes"]
    economica_df = data_dict["economica"]

    # Merge basado en ID (ajustar nombres de columnas según tu Excel)
    merged = estudiantes_df.merge(
        representantes_df, left_on="ID", right_on="ID_Estudiante", how="left"
    )
    merged = merged.merge(
        vivienda_df, left_on="ID", right_on="ID_Estudiante_viv", how="left"
    )
    merged = merged.merge(
        bienes_df, left_on="ID", right_on="ID_Estudiante_bie", how="left"
    )
    merged = merged.merge(
        economica_df, left_on="ID", right_on="ID_Estudiante_eco", how="left"
    )

    logger.info(f"✓ Dataset consolidado: {len(merged)} registros")
    return merged


def prepare_students_table(merged_df):
    """
    Prepara datos para la tabla students
    """
    students = []

    for _, row in merged_df.iterrows():
        student = {
            "id": f"EST{str(row['ID']).zfill(3)}",
            "nombre": row.get("nombres", ""),
            "grado": row.get("Grado", ""),
            "seccion": row.get("Seccion", "A"),
            "edad": int(row.get("Edad", 0)) if pd.notna(row.get("Edad")) else None,
            "genero": row.get("genero", ""),
            "quintil": int(row.get("Quintil", 3)) if pd.notna(row.get("Quintil")) else None,
            "quintil_agrupado": row.get("Quintil_ML", "Medio"),
            "promedio_general": float(row.get("Promedio_General", 0.0))
            if pd.notna(row.get("Promedio_General"))
            else None,
        }
        students.append(student)

    return students


def prepare_socioeconomic_table(merged_df):
    """
    Prepara datos para la tabla socioeconomic_data
    """
    socioeconomic = []

    for _, row in merged_df.iterrows():
        data = {
            "student_id": f"EST{str(row['ID']).zfill(3)}",
            "nivel_instruccion_rep": row.get("Nivel Instruccion", ""),
            "edad_representante": int(row.get("Edad_representante", 0))
            if pd.notna(row.get("Edad_representante"))
            else None,
            "relacion": row.get("Relacion", ""),
            "estado_civil": row.get("Estado civil", ""),
            "laptop": row.get("Laptop") == "Si",
            "internet": row.get("Internet") == "Si",
            "computadora": row.get("Computadora") == "Si",
            "lectura_libros": row.get("Lectura_libros") == "Si",
            "numero_hermanos": int(row.get("Numero_Hermanos", 0))
            if pd.notna(row.get("Numero_Hermanos"))
            else 0,
            "tipo_vivienda": row.get("Tipo vivienda", ""),
            "indice_cobertura_salud": row.get("Indice_Cobertura_Salud", ""),
            "indice_acceso_tecnologico": row.get("Indice_Acceso_Tecnologico", ""),
            "indice_apoyo_familiar": row.get("Indice_Apoyo_Familiar", ""),
            "indice_accesibilidad_geografica": row.get(
                "Indice_Accesibilidad_Geografica", ""
            ),
        }
        socioeconomic.append(data)

    return socioeconomic


def insert_data(supabase_client, table_name, data, batch_size=100):
    """
    Inserta datos en Supabase por lotes
    """
    logger.info(f"Insertando {len(data)} registros en {table_name}...")

    total_inserted = 0

    for i in range(0, len(data), batch_size):
        batch = data[i : i + batch_size]

        try:
            response = supabase_client.table(table_name).insert(batch).execute()
            total_inserted += len(batch)
            logger.info(f"  ✓ Insertados {total_inserted}/{len(data)} registros")
        except Exception as e:
            logger.error(f"  ✗ Error en lote {i}: {str(e)}")

    logger.info(f"✓ Total insertado en {table_name}: {total_inserted} registros")


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="Importar datos desde Excel a Supabase"
    )
    parser.add_argument(
        "--excel_path",
        type=str,
        required=True,
        help="Ruta al archivo Excel con los datos",
    )
    parser.add_argument(
        "--skip_students",
        action="store_true",
        help="Saltar inserción de estudiantes (si ya existen)",
    )

    args = parser.parse_args()

    try:
        # Conectar a Supabase
        supabase = connect_to_supabase()
        logger.info("✓ Conectado a Supabase")

        # Cargar datos desde Excel
        data_dict = load_excel_data(args.excel_path)

        # Consolidar datos
        merged_df = merge_data(data_dict)

        # Preparar datos para cada tabla
        students_data = prepare_students_table(merged_df)
        socioeconomic_data = prepare_socioeconomic_table(merged_df)

        # Insertar datos
        if not args.skip_students:
            insert_data(supabase, "students", students_data)

        insert_data(supabase, "socioeconomic_data", socioeconomic_data)

        logger.info("✓ ¡Importación completada exitosamente!")

    except Exception as e:
        logger.error(f"✗ Error en la importación: {str(e)}")
        raise


if __name__ == "__main__":
    main()
