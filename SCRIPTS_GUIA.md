# 🎯 Scripts Disponibles por Sistema Operativo

## 📋 Resumen Rápido

| Script | Linux/macOS | Windows CMD | Windows PowerShell |
|--------|-------------|-------------|-------------------|
| **Iniciar FastAPI** | `./model-api/start_server.sh` | `model-api\start_server.bat` | `.\model-api\start_server.ps1` |
| **Test Integración** | `./test_integration.sh` | *(manual)* | *(manual)* |
| **Test Modelo Local** | `python model-api/test_inference.py` | `python model-api\test_inference.py` | `python model-api\test_inference.py` |

---

## 🐧 Linux / macOS

### Iniciar FastAPI
```bash
cd model-api
chmod +x start_server.sh
./start_server.sh
```

### Test de Integración
```bash
chmod +x test_integration.sh
./test_integration.sh
```

### Test del Modelo Local
```bash
source venv/bin/activate
python model-api/test_inference.py
```

---

## 🪟 Windows

### Iniciar FastAPI

**Opción 1: CMD (Símbolo del sistema)**
```cmd
cd model-api
start_server.bat
```

**Opción 2: PowerShell (Recomendado)**
```powershell
cd model-api
.\start_server.ps1
```

> **Nota**: Si PowerShell bloquea scripts, ejecuta primero:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Test del Modelo Local
```cmd
venv\Scripts\activate.bat
python model-api\test_inference.py
```

### Test de Integración (Manual)

**PowerShell:**
```powershell
# 1. Verificar FastAPI
Invoke-WebRequest -Uri http://localhost:8001/health | Select-Object -Expand Content

# 2. Test de predicción
$body = @{
    pickup_dt_str = "2020-02-01T08:30:00Z"
    pulocationid = 132
    dolocationid = 48
    trip_miles = 5.2
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/predict -Method Post -Body $body -ContentType "application/json"
```

**CMD (con curl):**
```cmd
REM 1. Verificar FastAPI
curl http://localhost:8001/health

REM 2. Test de predicción
curl -X POST "http://localhost:8001/predict" ^
  -H "Content-Type: application/json" ^
  -d "{\"pickup_dt_str\": \"2020-02-01T08:30:00Z\", \"pulocationid\": 132, \"dolocationid\": 48, \"trip_miles\": 5.2}"
```

---

## 📁 Estructura de Scripts

```
solucion-VibeCloud/
├── model-api/
│   ├── start_server.sh      # Linux/macOS
│   ├── start_server.bat     # Windows CMD
│   ├── start_server.ps1     # Windows PowerShell
│   ├── COMO_INICIAR.md      # Guía completa multiplataforma
│   └── test_inference.py    # Test local (todas las plataformas)
├── test_integration.sh       # Test completo (Linux/macOS)
└── INTEGRACION_COMPLETADA.md # Documentación completa
```

---

## ✅ Verificación

Después de iniciar FastAPI, verifica que funcione:

### Navegador (todas las plataformas)
Abre: http://localhost:8001/health

Deberías ver:
```json
{"status":"healthy","model_loaded":true,"model_dir":"..."}
```

### Línea de comandos

**Linux/macOS:**
```bash
curl http://localhost:8001/health
```

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:8001/health | Select-Object -Expand Content
```

**Windows CMD:**
```cmd
curl http://localhost:8001/health
```

---

## 🐛 Troubleshooting Común

### Error: "Permission denied" (Linux/macOS)
```bash
chmod +x start_server.sh
chmod +x test_integration.sh
```

### Error: "cannot be loaded" (Windows PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Puerto en uso"

**Linux/macOS:**
```bash
lsof -ti:8001 | xargs kill -9
```

**Windows PowerShell:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8001).OwningProcess | Stop-Process -Force
```

**Windows CMD:**
```cmd
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

---

## 📚 Documentación Adicional

- **Inicio del Servidor**: [model-api/COMO_INICIAR.md](model-api/COMO_INICIAR.md)
- **Integración Completa**: [INTEGRACION_COMPLETADA.md](INTEGRACION_COMPLETADA.md)
- **API del Modelo**: [model-api/README.md](model-api/README.md)

---

**¿Problemas?** Consulta la documentación específica para tu sistema operativo o abre un issue.
