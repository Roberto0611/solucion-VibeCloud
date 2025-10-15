# 🚀 Integración FastAPI + Laravel - Predicción de Duración de Viajes

## ✅ Completado

Se ha integrado exitosamente el modelo XGBoost con FastAPI y Laravel.

### Componentes Implementados

#### 1. **Servidor FastAPI** (`model-api/`)
- ✅ `main.py` - Servidor FastAPI con endpoints de predicción
- ✅ `inference.py` - Lógica del modelo XGBoost (ya existía)
- ✅ `requirements.txt` - Dependencias Python
- ✅ `start_server.sh` - Script para iniciar el servidor
- ✅ `README.md` - Documentación completa
- ✅ `test_inference.py` - Script de test local

**Endpoints disponibles:**
- `GET /` - Health check simple
- `GET /health` - Health check detallado
- `POST /predict` - Predicción individual
- `POST /predict/batch` - Predicción en batch
- `GET /docs` - Documentación Swagger UI automática

#### 2. **Controller Laravel** (`solucion-vibecloud/app/Http/Controllers/AWSController.php`)
- ✅ Actualizado método `predictTest()` para llamar al FastAPI local
- ✅ Validación de inputs con Laravel Validation
- ✅ Manejo de errores y timeouts
- ✅ Integración con `Http` facade de Laravel

#### 3. **Configuración**
- ✅ `.env` actualizado con `FASTAPI_URL=http://localhost:8001`
- ✅ Ruta API en `routes/api.php`: `POST /api/predict-test`

#### 4. **Testing**
- ✅ `test_integration.sh` - Script de prueba completo

---

## 🎯 Cómo Usar

### 1. Iniciar el Servidor FastAPI

**Opción A: Con el script (recomendado)**

**Linux/macOS:**
```bash
cd model-api
./start_server.sh
```

**Windows (CMD):**
```cmd
cd model-api
start_server.bat
```

**Windows (PowerShell):**
```powershell
cd model-api
.\start_server.ps1
```

> 📖 Ver [model-api/COMO_INICIAR.md](model-api/COMO_INICIAR.md) para más opciones y troubleshooting

**Opción B: Manualmente (Linux/macOS)**
```bash
cd /home/roc/Desktop/coding/solucion-VibeCloud
source venv/bin/activate
pip install -r model-api/requirements.txt
cd model-api
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Opción C: Manualmente (Windows)**
```cmd
cd model-api
..\venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Verificar que esté corriendo:**
```bash
curl http://localhost:8001/health
```

Deberías ver:
```json
{"status":"healthy","model_loaded":true,"model_dir":"/home/roc/Desktop/coding/solucion-VibeCloud/model-api"}
```

### 2. Iniciar Laravel

```bash
cd solucion-vibecloud
php artisan serve
```

Laravel correrá en `http://localhost:8000` (o el puerto que indique).

### 3. Probar la Integración

**Desde la terminal:**
```bash
curl -X POST "http://localhost:8000/api/predict-test" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "pickup_dt_str": "2020-02-01T08:30:00Z",
    "pulocationid": 132,
    "dolocationid": 48,
    "trip_miles": 5.2
  }'
```

**Desde React/JavaScript (ya implementado en MainPage.tsx):**
```javascript
const response = await fetch('http://localhost:8000/api/predict-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    pickup_dt_str: "2020-02-01T08:30:00Z",
    pulocationid: 132,
    dolocationid: 48,
    trip_miles: 5.2
  })
});

const data = await response.json();
console.log(`Duración predicha: ${data.prediction} minutos`);
```

**Script de test automático:**
```bash
./test_integration.sh
```

---

## 📊 Flujo de Datos

```
React Frontend (MainPage.tsx)
    ↓
    POST /api/predict-test
    ↓
Laravel (AWSController::predictTest)
    ↓
    HTTP Client → POST http://localhost:8001/predict
    ↓
FastAPI (main.py)
    ↓
    inference.py (model_fn, predict_fn)
    ↓
XGBoost Model
    ↓
    ← Predicción (duración en minutos)
    ↓
FastAPI Response (JSON)
    ↓
Laravel Response (JSON)
    ↓
React (alert con resultado)
```

---

## 🔧 Parámetros de Entrada

### Request Format
```json
{
  "pickup_dt_str": "2020-02-01T08:30:00Z",
  "pulocationid": 132,
  "dolocationid": 48,
  "trip_miles": 5.2
}
```

### Response Format
```json
{
  "success": true,
  "prediction": 21.66,
  "confidence": null,
  "input_data": {
    "pickup_dt_str": "2020-02-01T08:30:00Z",
    "pulocationid": 132,
    "dolocationid": 48,
    "trip_miles": 5.2
  },
  "message": "Predicción generada exitosamente"
}
```

---

## 🛠️ Troubleshooting

### FastAPI no responde
```bash
# Verificar si está corriendo
ps aux | grep uvicorn

# Ver logs
tail -f /tmp/fastapi.log

# Reiniciar
pkill -f "uvicorn.*8001"
cd model-api && ./start_server.sh
```

### Error "Model not loaded"
```bash
# Verificar que los archivos del modelo estén en model-api/
ls -la model-api/*.json model-api/*.xgb

# Reiniciar FastAPI
```

### Laravel no puede conectar a FastAPI
```bash
# Verificar FASTAPI_URL en .env
grep FASTAPI_URL solucion-vibecloud/.env

# Debe ser: FASTAPI_URL=http://localhost:8001
```

### Error "No space left on device"
```bash
# Limpiar cache de pip
rm -rf ~/.cache/pip

# Limpiar node_modules viejos si es necesario
```

---

## 📝 Próximos Pasos (Opcional)

### Mejoras Recomendadas

1. **Producción**
   - [ ] Dockerizar FastAPI
   - [ ] Usar gunicorn con workers
   - [ ] Configurar nginx como reverse proxy
   - [ ] Agregar autenticación (API keys)
   - [ ] Rate limiting

2. **Monitoreo**
   - [ ] Agregar logging estructurado
   - [ ] Métricas de Prometheus
   - [ ] Health checks avanzados
   - [ ] Alertas

3. **Features**
   - [ ] Intervalos de confianza en predicciones
   - [ ] Caché de predicciones frecuentes
   - [ ] Batch predictions desde Laravel
   - [ ] Versionado del modelo

4. **Testing**
   - [ ] Tests unitarios de FastAPI
   - [ ] Tests de integración Laravel
   - [ ] Tests end-to-end con React

---

## 📚 Documentación Adicional

- **FastAPI Docs**: http://localhost:8001/docs (Swagger UI automático)
- **FastAPI ReDoc**: http://localhost:8001/redoc
- **Código**: Ver `model-api/README.md` para detalles técnicos

---

## ✨ Estado Actual

✅ **Servidor FastAPI**: Corriendo en http://localhost:8001  
✅ **Modelo XGBoost**: Cargado y funcionando  
✅ **Laravel Controller**: Integrado y validando  
✅ **React Frontend**: Ya configurado (MainPage.tsx)  
✅ **Testing**: Scripts de prueba disponibles  

**Todo listo para usar en desarrollo!** 🎉
