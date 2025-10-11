import pandas as pd
from geopy.geocoders import Nominatim
from time import sleep

# === CONFIGURACIÓN ===
input_file = r"solucion-vibecloud\python\taxi_zone_lookup.csv"              # Ruta del archivo original
output_file = r"solucion-vibecloud\python\taxi_zone_lookup_geocoded.csv"    # Archivo de salida
delay_seconds = 1                                # Pausa entre peticiones (respetar TOS de Nominatim)

# === CARGAR DATOS ===
df = pd.read_csv(input_file)

# Agregar columnas si no existen
if 'Latitude' not in df.columns:
    df['Latitude'] = None
if 'Longitude' not in df.columns:
    df['Longitude'] = None

# Inicializar geocodificador
geolocator = Nominatim(user_agent="geoapi_nyc_zones")

# Generar lista de zonas únicas
unique_zones = df[['Zone', 'Borough']].drop_duplicates().reset_index(drop=True)

def build_query(zone, borough):
    """Construye una cadena de búsqueda contextual."""
    parts = []
    if isinstance(zone, str) and zone.strip():
        parts.append(zone.strip())
    if isinstance(borough, str) and borough.strip():
        parts.append(borough.strip())
    parts.extend(["New York City", "USA"])
    return ", ".join(parts)

# Geocodificar cada zona única
coords_map = {}
for i, row in unique_zones.iterrows():
    query = build_query(row['Zone'], row['Borough'])
    print(f"[{i+1}/{len(unique_zones)}] Buscando: {query}")
    try:
        loc = geolocator.geocode(query, timeout=10)
        if loc:
            coords_map[query] = (loc.latitude, loc.longitude)
            print(f" → {loc.latitude}, {loc.longitude}")
        else:
            coords_map[query] = (None, None)
            print(" → No encontrado")
    except Exception as e:
        coords_map[query] = (None, None)
        print(" → Error:", e)
    sleep(delay_seconds)  # Respetar la tasa de Nominatim

# Asignar coordenadas al DataFrame
for i, row in df.iterrows():
    query = build_query(row['Zone'], row['Borough'])
    if query in coords_map:
        lat, lon = coords_map[query]
        df.at[i, 'Latitude'] = lat
        df.at[i, 'Longitude'] = lon

# === GUARDAR RESULTADO ===
df.to_csv(output_file, index=False)
print(f"\n✅ Archivo guardado como: {output_file}")
