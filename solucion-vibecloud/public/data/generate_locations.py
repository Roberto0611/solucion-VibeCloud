"""
Script para generar 1000 ubicaciones aleatorias en formato JSON
Centra las ubicaciones alrededor de Nueva York
"""
import json
import random

# Centro: Nueva York
center_lat = 40.714
center_lon = -74.006

# Radio aproximado (en grados) para dispersar los puntos
# 0.5 grados ≈ 55 km
spread = 0.5

locations = []

for i in range(1000):
    location = {
        "lat": center_lat + (random.random() - 0.5) * spread,
        "lon": center_lon + (random.random() - 0.5) * spread,
        "name": f"Location {i + 1}",
        "value": round(random.random() * 100, 2)
    }
    locations.append(location)

# Guardar en archivo JSON
with open('locations_1000.json', 'w') as f:
    json.dump(locations, f, indent=2)

print(f"✅ Generadas {len(locations)} ubicaciones en 'locations_1000.json'")

# Puse a copilot a que me generara un JSON para probarlo en mi leaflet yeah :)
