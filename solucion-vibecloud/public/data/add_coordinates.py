"""
Script para agregar latitud y longitud a cada ciudad del JSON de tráfico
usando la API de geopy (Nominatim de OpenStreetMap)
"""
import json
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

# Archivos de entrada y salida
INPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_averagest.json'
OUTPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_with_coordinates.json'

# Inicializar el geocoder
geolocator = Nominatim(user_agent="traffic_map_app")

# Mapeo de códigos de país a nombres completos (para casos que no funcionan)
COUNTRY_NAMES = {
    'TWN': 'Taiwan',
    'ROU': 'Romania',
    'ARE': 'United Arab Emirates',
    'GBR': 'United Kingdom',
    'USA': 'United States',
    'DEU': 'Germany',
    'ESP': 'Spain',
    'FRA': 'France',
    'ITA': 'Italy',
    'NLD': 'Netherlands',
    'CHE': 'Switzerland',
    'AUT': 'Austria',
    'BEL': 'Belgium',
    'POL': 'Poland',
    'CZE': 'Czech Republic',
    'HUN': 'Hungary',
    'BGR': 'Bulgaria',
    'GRC': 'Greece',
    'PRT': 'Portugal',
    'SWE': 'Sweden',
    'NOR': 'Norway',
    'DNK': 'Denmark',
    'FIN': 'Finland',
    'IRL': 'Ireland',
    'ISL': 'Iceland',
    'LUX': 'Luxembourg',
    'SVK': 'Slovakia',
    'SVN': 'Slovenia',
    'EST': 'Estonia',
    'LVA': 'Latvia',
    'LTU': 'Lithuania',
    'CAN': 'Canada',
    'MEX': 'Mexico',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
    'CHL': 'Chile',
    'COL': 'Colombia',
    'PER': 'Peru',
    'URY': 'Uruguay',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'JPN': 'Japan',
    'KOR': 'South Korea',
    'CHN': 'China',
    'IND': 'India',
    'THA': 'Thailand',
    'SGP': 'Singapore',
    'MYS': 'Malaysia',
    'IDN': 'Indonesia',
    'PHL': 'Philippines',
    'HKG': 'Hong Kong',
    'TUR': 'Turkey',
    'SAU': 'Saudi Arabia',
    'ARE': 'United Arab Emirates',
    'QAT': 'Qatar',
    'KWT': 'Kuwait',
    'EGY': 'Egypt',
    'ZAF': 'South Africa',
}


def get_coordinates(city, country):
    """
    Obtiene las coordenadas (lat, lon) de una ciudad
    """
    try:
        # Formatear el nombre de la ciudad (reemplazar guiones por espacios)
        city_formatted = city.replace('-', ' ').title()

        # Obtener el nombre completo del país
        country_name = COUNTRY_NAMES.get(country, country)

        # Buscar ubicación
        location = geolocator.geocode(
            f"{city_formatted}, {country_name}", timeout=10)

        if location:
            return {
                'lat': round(location.latitude, 6),
                'lon': round(location.longitude, 6)
            }
        else:
            print(f"⚠️  No se encontró: {city_formatted}, {country}")
            return None

    except GeocoderTimedOut:
        print(f"⏱️  Timeout: {city}, {country}")
        return None
    except GeocoderServiceError as e:
        print(f"❌ Error de servicio: {e}")
        return None
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return None


def add_coordinates_to_json():
    """
    Lee el JSON de tráfico y agrega coordenadas a cada ciudad
    """
    print("📂 Cargando archivo JSON...")

    with open(INPUT_JSON, 'r', encoding='utf-8') as f:
        cities = json.load(f)

    total = len(cities)
    print(f"📊 Total de ciudades: {total}\n")

    results = []

    for i, city in enumerate(cities, 1):
        print(
            f"[{i}/{total}] Buscando: {city['city']}, {city['country']}...", end=' ')

        coords = get_coordinates(city['city'], city['country'])

        if coords:
            city_with_coords = {
                'country': city['country'],
                'city': city['city'],
                'lat': coords['lat'],
                'lon': coords['lon'],
                'average_delay': city['average_delay']
            }
            results.append(city_with_coords)
            print(f"✅ ({coords['lat']}, {coords['lon']})")
        else:
            # Si no encuentra coordenadas, guardar sin ellas
            city_with_coords = {
                'country': city['country'],
                'city': city['city'],
                'lat': None,
                'lon': None,
                'average_delay': city['average_delay']
            }
            results.append(city_with_coords)
            print(f"❌")

        # Pausa para no saturar la API (1 request por segundo máximo)
        time.sleep(1.1)

    # Guardar resultados
    print(f"\n💾 Guardando resultados en '{OUTPUT_JSON}'...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Estadísticas
    found = sum(1 for city in results if city['lat'] is not None)
    not_found = total - found

    print(f"\n✅ Proceso completado!")
    print(f"📊 Ciudades con coordenadas: {found}/{total}")
    print(f"⚠️  Ciudades sin coordenadas: {not_found}/{total}")
    print(f"💾 Archivo guardado: {OUTPUT_JSON}")


if __name__ == "__main__":
    try:
        add_coordinates_to_json()
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{INPUT_JSON}'")
    except Exception as e:
        print(f"❌ Error: {e}")
