# VibeCloud: Productización de Soluciones - NYC Taxi Trip Predictor

<p align="center">
  <img width="525" height="303" alt="Screenshot 2025-10-07 at 10 26 07" src="https://github.com/user-attachments/assets/503da566-882f-46ae-9041-3f4f57407df4" />
</p>

### Objetivo
Aplicar EDA y visualización/algoritmos para detectar patrones en **viajes de taxi y limosina en Nueva York (NYC)** y traducirlos en **recomendaciones accionables** listas para producto (MVPs, dashboards o scripts reutilizables).

- **Datos**: se consumen **directo desde la nube** (AWS Open Data): https://registry.opendata.aws/nyc-tlc-trip-records-pds/

---

## 🚀 Quick Start

### Iniciar el Sistema Completo

**Linux/macOS:**
```bash
# 1. Iniciar FastAPI
cd model-api
./start_server.sh
```

**Windows:**
```cmd
# CMD
cd model-api
start_server.bat

# O PowerShell
cd model-api
.\start_server.ps1
```

Luego en otra terminal/ventana:
```bash
# 2. Iniciar Laravel
cd solucion-vibecloud
php artisan serve

# 3. Abrir en el navegador
# http://localhost:8000
```

> 📖 **Guía completa de scripts**: Ver [SCRIPTS_GUIA.md](SCRIPTS_GUIA.md) para todos los comandos por sistema operativo

### Componentes del Sistema

#### 🤖 Modelo API (FastAPI + XGBoost)
- **Puerto**: 8001
- **Health Check**: http://localhost:8001/health
- **Documentación**: http://localhost:8001/docs
- **Predicción**: POST http://localhost:8001/predict

```bash
# Iniciar solo FastAPI
cd model-api
./start_server.sh
```

#### 🌐 Backend (Laravel)
- **Puerto**: 8000 (por defecto)
- **API Endpoint**: POST /api/predict-test

```bash
cd solucion-vibecloud
php artisan serve
```

#### ⚛️ Frontend (React + Inertia)
- Incluido en Laravel
- Ver `resources/js/pages/MainPage.tsx`

---

## 📚 Documentación

- **[INTEGRACION_COMPLETADA.md](INTEGRACION_COMPLETADA.md)** - Guía completa de integración
- **[model-api/README.md](model-api/README.md)** - Documentación del API del modelo
- **[requirements.md](requirements.md)** - Requisitos del proyecto

### Scripts Útiles

```bash
# Test de integración completo
./test_integration.sh

# Test del modelo local
cd model-api
python test_inference.py

# Quick start (inicia FastAPI automáticamente)
./quick_start.sh
```

---

## Estructura del repositorio
```
reto/
│
├── README.md                 # uso del repositorio
└── solucion-equipo/         # entregables por equipo (en su propia carpeta)
```
---

## Reglas de colaboración
1. Cada equipo debe hacer _fork_ de este repositorio
2. Dentro del fork, crear su carpeta  con el formato:  
   `solucion-<nombre_equipo>`
3. Subir todos sus archivos únicamente dentro de su carpeta de equipo.
4. No modifiques la rama `main` del repo original. Trabaja en tu fork.
---

## Flujo de trabajo (equipos)
1) Hacer fork desde GitHub  
2) Clonar el fork en local:
```bash
git clone https://github.com/<tu_usuario>/<tu_fork>.git
cd <tu_fork>
```
3) **Crear la carpeta del equipo** y agregar contenido:
```bash
mkdir -p solucion-<nombre_equipo> # puedes añadir notebooks, scripts, dashboards exportables y un README propio.
```
4) **Commit & push** a tu fork:
```bash
git add .
git commit -m "Inicial: solucion-<nombre_equipo>"
git push origin main
```

---


¡Éxito en el reto! 💡  
— Data Science Club at Tec
