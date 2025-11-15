"""
Script para limpiar tablas de Supabase antes de importar datos
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv()

def main():
    # Conectar a Supabase con SERVICE_KEY para tener permisos de escritura
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Asegúrate de que SUPABASE_URL y SUPABASE_SERVICE_KEY están en .env")
        return
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🧹 LIMPIANDO TABLAS DE SUPABASE")
    print("=" * 70)
    
    # Orden de eliminación: primero las tablas dependientes
    tables = [
        "risk_predictions",
        "academic_performance", 
        "attendance",
        "socioeconomic_data",
        "students"
    ]
    
    for table in tables:
        try:
            # Contar registros antes
            count_before = len(supabase.table(table).select("*").execute().data)
            
            if count_before > 0:
                # Eliminar todos los registros usando gt con un ID negativo 
                # (asumiendo que todos los IDs son >= 0)
                if table == "students":
                    # students usa TEXT id
                    supabase.table(table).delete().neq("id", "").execute()
                else:
                    # otras tablas usan INTEGER id
                    supabase.table(table).delete().gte("id", 0).execute()
                
                count_after = len(supabase.table(table).select("*").execute().data)
                print(f"✅ {table}: {count_before} → {count_after} registros")
            else:
                print(f"✓ {table}: ya estaba vacía")
                
        except Exception as e:
            print(f"❌ Error limpiando {table}: {e}")
    
    print("=" * 70)
    print("✅ Tablas limpiadas. Ahora puedes ejecutar import_fase2_csv.py")

if __name__ == "__main__":
    main()
