# GUÍA DE SETUP COMPLETO - Academic Early Warning System

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Setup del Backend](#setup-del-backend)
4. [Setup del Frontend](#setup-del-frontend)
5. [Testing Local](#testing-local)
6. [Troubleshooting](#troubleshooting)

---

## 1. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.8+**: [Descargar](https://www.python.org/downloads/)
- **Node.js 14+**: [Descargar](https://nodejs.org/)
- **Git**: [Descargar](https://git-scm.com/)
- **Cuenta en Supabase**: [Crear cuenta gratis](https://supabase.com/)

### Verificar instalaciones:
```powershell
python --version
node --version
npm --version
git --version
```

---

## 2. Configuración de Supabase

### Paso 1: Crear un nuevo proyecto en Supabase

1. Ve a [https://supabase.com/](https://supabase.com/)
2. Inicia sesión o crea una cuenta
3. Click en **"New Project"**
4. Configura:
   - **Name**: `academic-early-warning`
   - **Database Password**: (oregano121345#)
   - **Region**: Selecciona la más cercana
5. Click en **"Create new project"** (tarda ~2 minutos)

### Paso 2: Crear las tablas en Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor** (menú izquierdo)
2. Click en **"New Query"**
3. Copia y pega TODO el contenido del archivo `backend/models/schema.sql`
4. Click en **"Run"** (▶)
5. Verifica que se crearon las tablas en **"Table Editor"**

### Paso 3: Obtener las credenciales

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (clave pública)
   - **service_role**: `eyJhbGc...` (clave privada - NUNCA la expongas en frontend)

---

## 3. Setup del Backend

### Paso 1: Navegar a la carpeta backend
```powershell
cd backend
```

### Paso 2: Crear entorno virtual
```powershell
python -m venv venv
```

### Paso 3: Activar entorno virtual
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Si da error de permisos, ejecuta:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Paso 4: Instalar dependencias
```powershell
pip install -r requirements.txt
```

### Paso 5: Configurar variables de entorno

1. Copia el archivo de ejemplo:
```powershell
copy .env.example .env
```

2. Edita `.env` con tus credenciales de Supabase:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion

# Supabase Configuration (REEMPLAZA CON TUS VALORES)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui

# Database Configuration
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Model Configuration
MODEL_PATH=./models/trained/catboost_model.pkl
MODEL_VERSION=1.0.0
```

### Paso 6: Ejecutar el servidor
```powershell
python app.py
```

Deberías ver:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Paso 7: Probar que funciona

Abre otra terminal y ejecuta:
```powershell
curl http://localhost:5000/health
```

Deberías recibir:
```json
{"status": "healthy", "service": "flask-backend"}
```

---

## 4. Setup del Frontend

### Paso 1: Navegar a la carpeta frontend
```powershell
cd ..\frontend
# O desde la raíz:
cd frontend
```

### Paso 2: Instalar dependencias
```powershell
npm install
```

### Paso 3: Configurar variable de entorno

Crea un archivo `.env` en la carpeta `frontend`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Paso 4: Ejecutar el servidor de desarrollo
```powershell
npm start
```

El navegador se abrirá automáticamente en `http://localhost:3000`

---

## 5. Testing Local

### Test 1: Backend Health Check
```powershell
curl http://localhost:5000/health
```

### Test 2: Obtener lista SAT (con datos mock)
```powershell
curl http://localhost:5000/api/sat-list
```

### Test 3: Obtener perfil de estudiante
```powershell
curl http://localhost:5000/api/student/EST001
```

### Test 4: Estadísticas institucionales
```powershell
curl http://localhost:5000/api/institutional-stats
```

### Test 5: Frontend

1. Abre el navegador en `http://localhost:3000`
2. Deberías ver el Dashboard SAT
3. Navega a "Visión Institucional"
4. Click en un estudiante para ver su perfil

---

## 6. Troubleshooting

### Error: "supabase module not found"
```powershell
pip install supabase
```

### Error: "No module named 'flask_cors'"
```powershell
pip install flask-cors
```

### Error: CORS en el frontend

Verifica que en `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

### Error: "Cannot connect to Supabase"

1. Verifica que `SUPABASE_URL` y `SUPABASE_KEY` sean correctos
2. Verifica que las tablas existan en Supabase (SQL Editor → Table Editor)
3. Verifica que Row Level Security (RLS) esté configurado correctamente

### Backend no retorna datos (lista vacía)

Es normal si aún no has cargado datos en Supabase. Para probar con datos mock:

1. Edita `backend/services/supabase_client.py`
2. Importa mocks: `from services.mocks import get_mock_students`
3. Reemplaza temporalmente el método `get_students()` para retornar `get_mock_students()`

### Puerto 5000 o 3000 ya en uso

**Backend (5000):**
```powershell
# Cambiar puerto en app.py
app.run(host="0.0.0.0", port=5001)

# Actualizar .env en frontend
REACT_APP_API_URL=http://localhost:5001/api
```

**Frontend (3000):**
```powershell
# Agregar en package.json scripts:
"start": "PORT=3001 react-scripts start"
```

---

## 📚 Próximos Pasos

1. **Cargar datos reales**: Crea un script Python para importar los datos de tu Excel a Supabase
2. **Entrenar modelo CatBoost**: Guarda el modelo entrenado en `backend/models/trained/`
3. **Implementar autenticación**: Agregar login para profesores del DCE
4. **Deploy a producción**: Usar Railway/Render para backend, Vercel para frontend

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs del backend en la consola
2. Revisa la consola del navegador (F12) para errores del frontend
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que backend y frontend estén corriendo simultáneamente

---

## ✅ Checklist de Verificación

- [ ] Python 3.8+ instalado
- [ ] Node.js 14+ instalado
- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas con schema.sql
- [ ] Credenciales de Supabase en backend/.env
- [ ] Entorno virtual de Python activado
- [ ] Dependencias de backend instaladas (pip install -r requirements.txt)
- [ ] Backend corriendo en http://localhost:5000
- [ ] Health check responde correctamente
- [ ] Dependencias de frontend instaladas (npm install)
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Dashboard SAT se visualiza correctamente
- [ ] API retorna datos (reales o mock)
