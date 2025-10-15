import json
from inference import model_fn, predict_fn, input_fn, output_fn

## python3 -m venv venv
## source venv/bin/activate

# 1. Cargar modelo
model = model_fn("model-api")

# 2. Crear input de prueba (simula un viaje)
sample_input = {
    "pickup_dt_str": "2020-02-01T08:30:00Z",
    "pulocationid": 132,
    "dolocationid": 48,
    "trip_miles": 5.2
}

# 3. Procesar input y hacer predicción
records = input_fn(json.dumps(sample_input), "application/json")
prediction = predict_fn(records, model)

# 4. Mostrar salida
output, content_type = output_fn(prediction)
print(content_type)
print(output)
