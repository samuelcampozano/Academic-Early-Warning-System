# Modelos ML Entrenados

Esta carpeta debe contener el modelo CatBoost entrenado.

## Modelo Requerido

- **Archivo**: `catboost_model.pkl`
- **Versión**: 1.0.0
- **Accuracy**: 75.12%
- **Features**: 107 variables
- **Dataset de entrenamiento**: 1,004 estudiantes

## Cómo generar el modelo

1. Ejecuta el notebook de entrenamiento de la Fase 1
2. Exporta el modelo con:
   ```python
   import joblib
   joblib.dump(model, 'catboost_model.pkl')
   ```
3. Copia el archivo `.pkl` a esta carpeta

## Nota

Por razones de tamaño, los modelos entrenados no se suben al repositorio (ver `.gitignore`).
Cada desarrollador debe generar o solicitar el modelo entrenado.

## Testing sin modelo

Para probar el backend sin el modelo ML:
- El servicio de predicciones usa un algoritmo simplificado basado en barreras
- Ver `backend/routes/predictions.py` → función `_predict_quintil_from_barriers()`
