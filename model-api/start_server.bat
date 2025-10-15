@echo off
REM Script para iniciar el servidor FastAPI en Windows

cd /d "%~dp0"

echo.
echo 🚀 Iniciando servidor FastAPI del modelo...
echo 📁 Directorio: %CD%
echo.

REM Verificar si el venv existe
if not exist "..\venv" (
    echo ❌ Error: No se encontró el virtualenv en ..\venv
    echo    Ejecuta primero: python -m venv ..\venv
    pause
    exit /b 1
)

REM Activar virtualenv
call ..\venv\Scripts\activate.bat

REM Verificar/instalar dependencias
echo 📦 Verificando dependencias...
pip install -q -r requirements.txt

echo.
echo ✅ Servidor listo en http://localhost:8001
echo 📖 Documentación en http://localhost:8001/docs
echo 🔍 Health check en http://localhost:8001/health
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar servidor
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
