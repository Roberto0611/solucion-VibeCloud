# PowerShell script para iniciar el servidor FastAPI en Windows

# Cambiar al directorio del script
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "🚀 Iniciando servidor FastAPI del modelo..." -ForegroundColor Green
Write-Host "📁 Directorio: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar si el venv existe
if (-not (Test-Path "..\venv")) {
    Write-Host "❌ Error: No se encontró el virtualenv en ..\venv" -ForegroundColor Red
    Write-Host "   Ejecuta primero: python -m venv ..\venv" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Activar virtualenv
& "..\venv\Scripts\Activate.ps1"

# Verificar/instalar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
pip install -q -r requirements.txt

Write-Host ""
Write-Host "✅ Servidor listo en http://localhost:8001" -ForegroundColor Green
Write-Host "📖 Documentación en http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "🔍 Health check en http://localhost:8001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
