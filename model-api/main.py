"""
FastAPI servidor para predicciones del modelo XGBoost de viajes
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import json
import logging
import os
import sys

# Agregar el directorio actual al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importar las funciones del modelo
from inference import model_fn, predict_fn, input_fn, output_fn

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear app FastAPI
app = FastAPI(
    title="VibeCloud Taxi Trip Duration Predictor",
    description="API para predecir duración de viajes de taxi usando XGBoost",
    version="1.0.0"
)

# Configurar CORS para permitir llamadas desde Laravel/React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo global (se carga al iniciar)
MODEL = None
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))


class TripPredictionRequest(BaseModel):
    """Request para predicción de un viaje"""
    pickup_dt_str: str = Field(..., description="Fecha/hora de pickup en formato ISO (ej: 2020-02-01T08:30:00Z)")
    pulocationid: int = Field(..., description="ID de la zona de pickup")
    dolocationid: int = Field(..., description="ID de la zona de dropoff")
    trip_miles: float = Field(..., description="Distancia del viaje en millas", gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "pickup_dt_str": "2020-02-01T08:30:00Z",
                "pulocationid": 132,
                "dolocationid": 48,
                "trip_miles": 5.2
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request para predicciones en batch"""
    instances: list[TripPredictionRequest] = Field(..., description="Lista de viajes a predecir")


class PredictionResponse(BaseModel):
    """Response con la predicción"""
    success: bool
    prediction: float = Field(..., description="Duración predicha en minutos")
    confidence: Optional[float] = Field(None, description="Nivel de confianza (opcional)")
    input_data: dict
    message: str


class BatchPredictionResponse(BaseModel):
    """Response para predicciones en batch"""
    success: bool
    predictions: list[float] = Field(..., description="Lista de duraciones predichas en minutos")
    count: int
    message: str


@app.on_event("startup")
async def load_model():
    """Cargar el modelo al iniciar el servidor"""
    global MODEL
    try:
        logger.info(f"Cargando modelo desde: {MODEL_DIR}")
        MODEL = model_fn(MODEL_DIR)
        logger.info("✅ Modelo cargado exitosamente")
    except Exception as e:
        logger.error(f"❌ Error al cargar el modelo: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "VibeCloud Taxi Trip Duration Predictor",
        "version": "1.0.0",
        "model_loaded": MODEL is not None
    }


@app.get("/health")
async def health():
    """Endpoint de salud detallado"""
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_dir": MODEL_DIR
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: TripPredictionRequest):
    """
    Predecir la duración de un viaje individual
    
    - **pickup_dt_str**: Fecha/hora de pickup (ISO format)
    - **pulocationid**: ID de zona de pickup
    - **dolocationid**: ID de zona de dropoff  
    - **trip_miles**: Distancia en millas
    
    Retorna la duración predicha en minutos
    """
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")
    
    try:
        # Convertir request a formato esperado por el modelo
        trip_data = request.model_dump()
        
        # Procesar con las funciones del modelo
        input_json = json.dumps(trip_data)
        records = input_fn(input_json, "application/json")
        predictions = predict_fn(records, MODEL)
        
        # La predicción es una lista, tomamos el primer elemento
        predicted_duration = float(predictions[0]) if predictions else 0.0
        
        logger.info(f"Predicción exitosa: {predicted_duration:.2f} min para viaje {trip_data}")
        
        return PredictionResponse(
            success=True,
            prediction=round(predicted_duration, 2),
            confidence=None,  # Podemos agregar esto después si calculamos intervalos
            input_data=trip_data,
            message="Predicción generada exitosamente"
        )
        
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar predicción: {str(e)}")


@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    """
    Predecir la duración de múltiples viajes en un solo request
    
    Acepta una lista de viajes y retorna predicciones para todos
    """
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")
    
    try:
        # Convertir todas las instancias a dicts
        trips_data = [trip.model_dump() for trip in request.instances]
        
        # Procesar con las funciones del modelo
        input_json = json.dumps({"instances": trips_data})
        records = input_fn(input_json, "application/json")
        predictions = predict_fn(records, MODEL)
        
        # Redondear predicciones
        predictions_rounded = [round(float(p), 2) for p in predictions]
        
        logger.info(f"Batch predicción exitosa: {len(predictions_rounded)} viajes procesados")
        
        return BatchPredictionResponse(
            success=True,
            predictions=predictions_rounded,
            count=len(predictions_rounded),
            message=f"{len(predictions_rounded)} predicciones generadas exitosamente"
        )
        
    except Exception as e:
        logger.error(f"Error en batch predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar predicciones: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
