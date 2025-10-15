#!/bin/bash
# Script de prueba de la integración Laravel → FastAPI → Modelo

echo "🧪 Test de Integración Completo"
echo "================================"
echo ""

# 1. Verificar que FastAPI esté corriendo
echo "1️⃣  Verificando FastAPI (puerto 8001)..."
FASTAPI_HEALTH=$(curl -s http://localhost:8001/health)
if [[ $FASTAPI_HEALTH == *"healthy"* ]]; then
    echo "✅ FastAPI está corriendo y el modelo está cargado"
    echo "   $FASTAPI_HEALTH"
else
    echo "❌ FastAPI no responde o el modelo no está cargado"
    echo "   Inicia el servidor con: cd model-api && ./start_server.sh"
    exit 1
fi

echo ""
echo "2️⃣  Probando predicción directa en FastAPI..."
FASTAPI_PRED=$(curl -s -X POST "http://localhost:8001/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_dt_str": "2020-02-01T08:30:00Z",
    "pulocationid": 132,
    "dolocationid": 48,
    "trip_miles": 5.2
  }')

if [[ $FASTAPI_PRED == *"prediction"* ]]; then
    echo "✅ Predicción exitosa desde FastAPI:"
    echo "$FASTAPI_PRED" | python3 -m json.tool 2>/dev/null || echo "$FASTAPI_PRED"
else
    echo "❌ Error en predicción de FastAPI"
    echo "$FASTAPI_PRED"
fi

echo ""
echo "3️⃣  Probando endpoint de Laravel (si está corriendo)..."
echo "   Nota: Laravel debe estar corriendo en algún puerto (generalmente 8000)"
echo ""
echo "   Comando de prueba manual:"
echo "   curl -X POST 'http://localhost:PUERTO/api/predict-test' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"pickup_dt_str\": \"2020-02-01T08:30:00Z\", \"pulocationid\": 132, \"dolocationid\": 48, \"trip_miles\": 5.2}'"
echo ""

# Intentar detectar Laravel
for PORT in 8000 8080 3000; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "   🔍 Detectado servidor en puerto $PORT, probando..."
        LARAVEL_RESP=$(curl -s -X POST "http://localhost:$PORT/api/predict-test" \
          -H "Content-Type: application/json" \
          -H "Accept: application/json" \
          -d '{
            "pickup_dt_str": "2020-02-01T08:30:00Z",
            "pulocationid": 132,
            "dolocationid": 48,
            "trip_miles": 5.2
          }')
        
        if [[ $LARAVEL_RESP == *"prediction"* ]] || [[ $LARAVEL_RESP == *"success"* ]]; then
            echo "   ✅ Laravel respondió correctamente:"
            echo "$LARAVEL_RESP" | python3 -m json.tool 2>/dev/null || echo "$LARAVEL_RESP"
            break
        else
            echo "   ⚠️  Respuesta del puerto $PORT:"
            echo "   $LARAVEL_RESP" | head -3
        fi
    fi
done

echo ""
echo "✅ Test completado"
