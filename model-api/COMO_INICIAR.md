# 🚀 Cómo Iniciar el Servidor FastAPI

El servidor FastAPI puede ejecutarse en **Linux/Mac** o **Windows**. Elige el método según tu sistema operativo:

---

## 🐧 Linux / macOS

### Método 1: Script Bash (Recomendado)
```bash
cd model-api
chmod +x start_server.sh
./start_server.sh
```

### Método 2: Manual
```bash
cd model-api
source ../venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🪟 Windows

### Método 1: Script Batch (CMD)
```cmd
cd model-api
start_server.bat
```

### Método 2: Script PowerShell (Recomendado para Windows)
```powershell
cd model-api
.\start_server.ps1
```

> **Nota**: Si PowerShell bloquea la ejecución de scripts, ejecuta primero:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Método 3: Manual (Windows CMD)
```cmd
cd model-api
..\venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Método 4: Manual (Windows PowerShell)
```powershell
cd model-api
..\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## ✅ Verificar que el Servidor Esté Corriendo

Después de iniciar el servidor, verifica que esté funcionando:

### Opción 1: Navegador
Abre en tu navegador:
- Health check: http://localhost:8001/health
- Documentación interactiva: http://localhost:8001/docs

### Opción 2: Terminal/CMD

**Linux/Mac:**
```bash
curl http://localhost:8001/health
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri http://localhost:8001/health | Select-Object -Expand Content
```

**Windows (CMD con curl):**
```cmd
curl http://localhost:8001/health
```

---

## 📊 Salida Esperada

Cuando el servidor inicie correctamente, deberías ver:

```
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:main:Cargando modelo desde: /ruta/al/modelo
INFO:main:✅ Modelo cargado exitosamente
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

---

## 🛑 Detener el Servidor

En cualquier sistema operativo:
- Presiona `Ctrl+C` en la terminal donde está corriendo el servidor

---

## 🐛 Troubleshooting

### Error: "venv no encontrado"
```bash
# Crear el virtualenv primero
python -m venv venv  # o python3 -m venv venv en Linux/Mac
```

### Error: "Puerto 8001 en uso"
```bash
# Linux/Mac
lsof -ti:8001 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8001).OwningProcess | Stop-Process -Force
```

### Error: "uvicorn no encontrado"
```bash
# Asegúrate de activar el venv e instalar dependencias
pip install -r requirements.txt
```

### Error: "Permission denied" (PowerShell)
```powershell
# Permitir ejecución de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Notas Importantes

1. **Puerto**: El servidor corre en el puerto **8001** (no 8000) para evitar conflictos con Laravel
2. **Virtualenv**: Siempre usa el virtualenv (`venv/`) para aislar las dependencias
3. **Reload**: El flag `--reload` reinicia el servidor automáticamente al detectar cambios en el código
4. **Producción**: Para producción, usa gunicorn o desactiva `--reload`

---

## 🚀 Siguientes Pasos

Después de iniciar FastAPI:

1. Verificar health check: http://localhost:8001/health
2. Explorar la API: http://localhost:8001/docs
3. Iniciar Laravel: `cd solucion-vibecloud && php artisan serve`
4. Probar la integración completa desde React

---

**¿Problemas?** Consulta la documentación completa en `INTEGRACION_COMPLETADA.md`
