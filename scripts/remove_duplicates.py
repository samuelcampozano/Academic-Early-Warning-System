"""Script para eliminar duplicados en socioeconomic_data"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print("=" * 60)
print("LIMPIANDO DUPLICADOS EN SOCIOECONOMIC_DATA")
print("=" * 60)

# Crear cliente
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 1. Obtener todos los registros agrupados por student_id
print("\n1. Identificando duplicados...")
response = supabase.table("socioeconomic_data").select("id, student_id").execute()
all_records = response.data

# Agrupar por student_id
from collections import defaultdict
grouped = defaultdict(list)
for record in all_records:
    grouped[record['student_id']].append(record['id'])

# Encontrar duplicados
duplicates = {sid: ids for sid, ids in grouped.items() if len(ids) > 1}

print(f"✅ Total estudiantes: {len(grouped)}")
print(f"⚠️  Estudiantes con duplicados: {len(duplicates)}")

if duplicates:
    total_to_delete = sum(len(ids) - 1 for ids in duplicates.values())
    print(f"📋 Registros a eliminar: {total_to_delete}")
    
    print("\nEjemplos de duplicados:")
    for i, (student_id, ids) in enumerate(list(duplicates.items())[:5]):
        print(f"  {student_id}: {len(ids)} registros (IDs: {ids})")
    
    # Confirmar
    respuesta = input("\n¿Deseas eliminar los duplicados? (si/no): ")
    
    if respuesta.lower() == "si":
        print("\n2. Eliminando duplicados...")
        deleted_count = 0
        
        for student_id, ids in duplicates.items():
            # Mantener el primer ID, eliminar el resto
            ids_to_delete = ids[1:]
            
            for id_to_delete in ids_to_delete:
                try:
                    supabase.table("socioeconomic_data").delete().eq("id", id_to_delete).execute()
                    deleted_count += 1
                    if deleted_count % 50 == 0:
                        print(f"   Eliminados: {deleted_count}/{total_to_delete}")
                except Exception as e:
                    print(f"   ❌ Error eliminando ID {id_to_delete}: {e}")
        
        print(f"\n✅ Duplicados eliminados: {deleted_count}/{total_to_delete}")
        
        # Verificar
        print("\n3. Verificando limpieza...")
        response2 = supabase.table("socioeconomic_data").select("id, student_id").execute()
        all_records2 = response2.data
        
        grouped2 = defaultdict(list)
        for record in all_records2:
            grouped2[record['student_id']].append(record['id'])
        
        duplicates2 = {sid: ids for sid, ids in grouped2.items() if len(ids) > 1}
        
        print(f"✅ Total estudiantes: {len(grouped2)}")
        print(f"⚠️  Duplicados restantes: {len(duplicates2)}")
        
        if len(duplicates2) == 0:
            print("\n🎉 ¡LIMPIEZA EXITOSA! Todos los duplicados fueron eliminados.")
        else:
            print(f"\n⚠️  Aún quedan {len(duplicates2)} estudiantes con duplicados.")
    else:
        print("\n❌ Operación cancelada.")
else:
    print("\n✅ No hay duplicados para eliminar.")

print("\n" + "=" * 60)
print("PROCESO COMPLETADO")
print("=" * 60)
