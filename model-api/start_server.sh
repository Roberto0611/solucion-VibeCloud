#!/bin/bash
# Script para iniciar el servidor FastAPI

cd "$(dirname "$0")"

echo "🚀 Iniciando servidor FastAPI del modelo..."
echo "📁 Directorio: $(pwd)"
echo ""

# Verificar si el venv existe
if [ ! -d "../venv" ]; then
    echo "❌ Error: No se encontró el virtualenv en ../venv"
    echo "   Ejecuta primero: python3 -m venv ../venv"
    exit 1
fi

# Activar virtualenv
source ../venv/bin/activate

# Verificar/instalar dependencias
echo "📦 Verificando dependencias..."
pip install -q -r requirements.txt

echo ""
echo "✅ Servidor listo en http://localhost:8000"
echo "📖 Documentación en http://localhost:8000/docs"
echo "🔍 Health check en http://localhost:8000/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
