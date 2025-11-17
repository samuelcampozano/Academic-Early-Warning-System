# Scripts de Utilidades

Esta carpeta contiene scripts útiles para mantenimiento y operación del sistema.

## 📁 Scripts Disponibles

### 1. `import_data_to_supabase.py`

Importa datos desde el archivo Excel de la encuesta socioeconómica a Supabase.

**Uso:**
```powershell
python scripts\import_data_to_supabase.py --excel_path "ruta\al\archivo.xlsx"
```

**Requisitos:**
- Archivo Excel con 5 hojas: Estudiantes, Representantes, Vivienda, Bienes, Económica
- Variables de entorno configuradas en `.env`
- Tablas creadas en Supabase (ejecutar `models/schema.sql` primero)

**Opciones:**
- `--skip_students`: Saltar inserción de estudiantes si ya existen

**Ejemplo:**
```powershell
python scripts\import_data_to_supabase.py --excel_path "C:\datos\encuesta_2025.xlsx"
```

---

## 🚀 Próximos Scripts (Por Desarrollar)

### 2. `generate_predictions.py`
Script para generar predicciones de riesgo para todos los estudiantes en batch.

### 3. `export_reports.py`
Exporta reportes en PDF con perfiles de estudiantes en riesgo.

### 4. `update_grades.py`
Actualiza calificaciones desde archivos CSV/Excel.

### 5. `backup_database.py`
Genera backup de la base de datos de Supabase.

---

## 📝 Notas de Desarrollo

- Todos los scripts asumen que las variables de entorno están configuradas en `backend/.env`
- Se recomienda ejecutar los scripts desde la carpeta `backend/`
- Los logs se muestran en consola con nivel INFO
