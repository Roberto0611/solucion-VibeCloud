#!/bin/bash
# Quick Start - VibeCloud Model API

echo "🚀 VibeCloud - Quick Start"
echo "=========================="
echo ""

# Directorio base
BASE_DIR="/home/roc/Desktop/coding/solucion-VibeCloud"
cd "$BASE_DIR"

# 1. Iniciar FastAPI
echo "1️⃣  Iniciando servidor FastAPI..."
if pgrep -f "uvicorn.*8001" > /dev/null; then
    echo "   ℹ️  FastAPI ya está corriendo"
else
    nohup venv/bin/python -c "import sys; sys.path.insert(0, 'model-api'); from main import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8001)" > /tmp/fastapi.log 2>&1 &
    sleep 3
    
    if curl -s http://localhost:8001/health > /dev/null 2>&1; then
        echo "   ✅ FastAPI iniciado en http://localhost:8001"
    else
        echo "   ❌ Error al iniciar FastAPI. Ver logs: tail -f /tmp/fastapi.log"
        exit 1
    fi
fi

echo ""
echo "2️⃣  Información del servidor:"
echo "   📡 FastAPI Health: http://localhost:8001/health"
echo "   📖 Documentación: http://localhost:8001/docs"
echo ""

# Test rápido
echo "3️⃣  Test rápido de predicción..."
RESULT=$(curl -s -X POST "http://localhost:8001/predict" \
  -H "Content-Type: application/json" \
  -d '{"pickup_dt_str": "2020-02-01T08:30:00Z", "pulocationid": 132, "dolocationid": 48, "trip_miles": 5.2}')

if [[ $RESULT == *"prediction"* ]]; then
    PREDICTION=$(echo $RESULT | python3 -c "import sys, json; print(json.load(sys.stdin)['prediction'])")
    echo "   ✅ Predicción de prueba: $PREDICTION minutos"
else
    echo "   ⚠️  Error en predicción de prueba"
fi

echo ""
echo "=========================="
echo "✅ Sistema listo!"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Inicia Laravel: cd solucion-vibecloud && php artisan serve"
echo "   2. Abre el frontend: http://localhost:8000"
echo "   3. Prueba desde React o usa el endpoint /api/predict-test"
echo ""
echo "🛑 Para detener FastAPI: pkill -f 'uvicorn.*8001'"
