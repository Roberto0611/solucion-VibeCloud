"""
Script para agregar coordenadas del centro geográfico de cada país
al JSON de tráfico por país
"""
import json
from geopy.geocoders import Nominatim
import time

# Archivos de entrada y salida
INPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_by_country.json'
OUTPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_by_country_with_coords.json'

# Inicializar el geocoder
geolocator = Nominatim(user_agent="traffic_map_country_app")

# Mapeo de códigos de país a nombres completos
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
    'QAT': 'Qatar',
    'KWT': 'Kuwait',
    'EGY': 'Egypt',
    'ZAF': 'South Africa',
}


def get_country_center(country_code):
    """
    Obtiene las coordenadas del centro geográfico de un país
    """
    try:
        # Obtener el nombre completo del país
        country_name = COUNTRY_NAMES.get(country_code, country_code)

        # Buscar el país (esto devuelve el centro geográfico)
        location = geolocator.geocode(country_name, timeout=10)

        if location:
            return {
                'lat': round(location.latitude, 6),
                'lon': round(location.longitude, 6)
            }
        else:
            print(f"⚠️  No se encontró: {country_name} ({country_code})")
            return None

    except Exception as e:
        print(f"❌ Error con {country_code}: {e}")
        return None


def add_coordinates_to_countries():
    """
    Lee el JSON de tráfico por país y agrega coordenadas del centro geográfico
    """
    print("📂 Cargando archivo JSON...")

    with open(INPUT_JSON, 'r', encoding='utf-8') as f:
        countries = json.load(f)

    total = len(countries)
    print(f"📊 Total de países: {total}\n")

    results = []

    for i, country in enumerate(countries, 1):
        country_code = country['country']
        country_name = COUNTRY_NAMES.get(country_code, country_code)

        print(
            f"[{i}/{total}] Buscando centro de: {country_name} ({country_code})...", end=' ')

        coords = get_country_center(country_code)

        if coords:
            country_with_coords = {
                'country': country_code,
                'country_name': country_name,
                'lat': coords['lat'],
                'lon': coords['lon'],
                'average_delay': country['average_delay']
            }
            results.append(country_with_coords)
            print(f"✅ ({coords['lat']}, {coords['lon']})")
        else:
            # Si no encuentra coordenadas, guardar sin ellas
            country_with_coords = {
                'country': country_code,
                'country_name': country_name,
                'lat': None,
                'lon': None,
                'average_delay': country['average_delay']
            }
            results.append(country_with_coords)
            print(f"❌")

        # Pausa para no saturar la API
        time.sleep(1.1)

    # Guardar resultados
    print(f"\n💾 Guardando resultados en '{OUTPUT_JSON}'...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Estadísticas
    found = sum(1 for country in results if country['lat'] is not None)
    not_found = total - found

    print(f"\n✅ Proceso completado!")
    print(f"📊 Países con coordenadas: {found}/{total}")
    print(f"⚠️  Países sin coordenadas: {not_found}/{total}")
    print(f"💾 Archivo guardado: {OUTPUT_JSON}")


if __name__ == "__main__":
    try:
        add_coordinates_to_countries()
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{INPUT_JSON}'")
    except Exception as e:
        print(f"❌ Error: {e}")
