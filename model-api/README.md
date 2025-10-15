# VibeCloud - Modelo API FastAPI

API REST para predicciones de duración de viajes de taxi usando XGBoost.

## 🚀 Inicio Rápido

### 1. Iniciar el servidor

**Linux/macOS:**
```bash
cd model-api
chmod +x start_server.sh
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

> 📖 **Más opciones**: Ver [COMO_INICIAR.md](COMO_INICIAR.md) para métodos alternativos y troubleshooting

El servidor estará disponible en: http://localhost:8001

### 2. Documentación automática

FastAPI genera documentación interactiva automáticamente:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 📡 Endpoints

### `GET /` - Health Check Simple
```bash
curl http://localhost:8001/
```

### `GET /health` - Health Check Detallado
```bash
curl http://localhost:8001/health
```

### `POST /predict` - Predicción Individual

**Request:**
```bash
curl -X POST "http://localhost:8001/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_dt_str": "2020-02-01T08:30:00Z",
    "pulocationid": 132,
    "dolocationid": 48,
    "trip_miles": 5.2
  }'
```

**Response:**
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

### `POST /predict/batch` - Predicción en Batch

**Request:**
```bash
curl -X POST "http://localhost:8001/predict/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [
      {
        "pickup_dt_str": "2020-02-01T08:30:00Z",
        "pulocationid": 132,
        "dolocationid": 48,
        "trip_miles": 5.2
      },
      {
        "pickup_dt_str": "2020-02-01T18:00:00Z",
        "pulocationid": 100,
        "dolocationid": 200,
        "trip_miles": 3.8
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "predictions": [21.66, 15.32],
  "count": 2,
  "message": "2 predicciones generadas exitosamente"
}
```

## 🔧 Integración con Laravel

### Ejemplo de Controller en Laravel

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PredictionController extends Controller
{
    private $modelApiUrl = 'http://localhost:8001';

    public function predict(Request $request)
    {
        $validated = $request->validate([
            'pickup_dt_str' => 'required|string',
            'pulocationid' => 'required|integer',
            'dolocationid' => 'required|integer',
            'trip_miles' => 'required|numeric|min:0',
        ]);

        try {
            $response = Http::timeout(30)
                ->post("{$this->modelApiUrl}/predict", $validated);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener predicción'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de conexión con el servicio de predicción: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

### Ejemplo desde React

```javascript
async function getPrediction(tripData) {
  try {
    const response = await fetch('http://localhost:8001/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
}

// Uso
const result = await getPrediction({
  pickup_dt_str: "2020-02-01T08:30:00Z",
  pulocationid: 132,
  dolocationid: 48,
  trip_miles: 5.2
});

console.log(`Duración predicha: ${result.prediction} minutos`);
```

## 🔒 Producción

Para producción, considera:

1. **Usar gunicorn** en lugar de uvicorn solo:
```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

2. **Configurar CORS** correctamente en `main.py`:
```python
allow_origins=["https://tu-dominio.com"]
```

3. **Agregar autenticación** si es necesario (API keys, JWT, etc.)

4. **Usar nginx** como reverse proxy

5. **Monitoreo y logs** con herramientas como Prometheus, Grafana

## 📝 Notas

- El modelo se carga automáticamente al iniciar el servidor
- El servidor corre en modo `--reload` en desarrollo (se reinicia al cambiar código)
- Los logs se muestran en la consola con nivel INFO
- Todas las respuestas incluyen validación de entrada con Pydantic
